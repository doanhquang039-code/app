import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedExpenseGroup, SharedExpense, GroupSettlement } from '../../entities/shared-expense.entity';
import { User } from '../../entities/user.entity';
import { CreateGroupDto, CreateSharedExpenseDto, UpdateGroupDto } from './dto/shared-expense.dto';

@Injectable()
export class SharedExpensesService {
  constructor(
    @InjectRepository(SharedExpenseGroup)
    private groupRepository: Repository<SharedExpenseGroup>,
    @InjectRepository(SharedExpense)
    private expenseRepository: Repository<SharedExpense>,
    @InjectRepository(GroupSettlement)
    private settlementRepository: Repository<GroupSettlement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Group Management
  async createGroup(ownerId: number, createGroupDto: CreateGroupDto): Promise<SharedExpenseGroup> {
    const group = this.groupRepository.create({
      ...createGroupDto,
      ownerId,
    });
    const savedGroup = await this.groupRepository.save(group);

    // Add owner as member
    const ownerUser = await this.userRepository.findOne({ where: { id: ownerId } });
    if (ownerUser) {
      savedGroup.members = [ownerUser];
      return this.groupRepository.save(savedGroup);
    }
    return savedGroup;
  }

  async getGroupsForUser(userId: number): Promise<SharedExpenseGroup[]> {
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'members')
      .where('group.ownerId = :userId', { userId })
      .orWhere(':userId IN (SELECT userId FROM group_members WHERE groupId = group.id)', { userId })
      .getMany();

    return groups;
  }

  async getGroupDetails(groupId: number, userId: number): Promise<SharedExpenseGroup | null> {
    return this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'owner'],
    });
  }

  async addMemberToGroup(groupId: number, newMemberId: number, requestingUserId: number): Promise<SharedExpenseGroup> {
    const group = await this.verifyGroupOwner(groupId, requestingUserId);
    const user = await this.userRepository.findOne({ where: { id: newMemberId } });

    if (!user) {
      throw new Error('User not found');
    }

    if (!group.members) {
      group.members = [];
    }
    group.members.push(user);

    return this.groupRepository.save(group);
  }

  async removeMemberFromGroup(groupId: number, memberId: number, requestingUserId: number): Promise<SharedExpenseGroup> {
    const group = await this.verifyGroupOwner(groupId, requestingUserId);
    group.members = group.members.filter(m => m.id !== memberId);
    return this.groupRepository.save(group);
  }

  async updateGroup(groupId: number, userId: number, updateGroupDto: UpdateGroupDto): Promise<SharedExpenseGroup> {
    const group = await this.verifyGroupOwner(groupId, userId);
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async deleteGroup(groupId: number, userId: number): Promise<void> {
    await this.verifyGroupOwner(groupId, userId);
    await this.groupRepository.delete({ id: groupId });
  }

  // Shared Expenses
  async createSharedExpense(userId: number, groupId: number, createExpenseDto: CreateSharedExpenseDto): Promise<SharedExpense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      groupId,
      paidByUserId: userId,
    });

    const savedExpense = await this.expenseRepository.save(expense);

    // Create settlements for each split
    const splits = JSON.parse(createExpenseDto.splits);
    for (const memberUserId in splits) {
      if (memberUserId !== userId.toString()) {
        await this.createOrUpdateSettlement(groupId, userId, parseInt(memberUserId), splits[memberUserId]);
      }
    }

    // Update group total
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (group) {
      group.totalAmount = Number(group.totalAmount) + Number(createExpenseDto.amount);
      await this.groupRepository.save(group);
    }

    return savedExpense;
  }

  async getGroupExpenses(groupId: number, userId: number): Promise<SharedExpense[]> {
    // Verify user is member of group
    const group = await this.getGroupDetails(groupId, userId);
    if (!group) {
      throw new Error('Access denied');
    }

    return this.expenseRepository.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async getExpenseDetails(expenseId: number, userId: number): Promise<SharedExpense> {
    const expense = await this.expenseRepository.findOne({
      where: { id: expenseId },
      relations: ['group', 'paidByUser'],
    });

    if (!expense) throw new Error('Expense not found');

    // Verify user is member of the group
    const isMember = await this.isGroupMember(expense.groupId, userId);
    if (!isMember) throw new Error('Access denied');

    return expense;
  }

  async deleteExpense(expenseId: number, userId: number): Promise<void> {
    const expense = await this.getExpenseDetails(expenseId, userId);

    if (expense.paidByUserId !== userId) {
      throw new Error('Only expense creator can delete');
    }

    // Remove settlements
    await this.settlementRepository.delete({
      groupId: expense.groupId,
    });

    // Update group total
    const group = await this.groupRepository.findOne({ where: { id: expense.groupId } });
    if (group) {
      group.totalAmount = Number(group.totalAmount) - Number(expense.amount);
      await this.groupRepository.save(group);
    }

    await this.expenseRepository.delete({ id: expenseId });
  }

  // Settlement Tracking
  async getSettlementsForGroup(groupId: number, userId: number): Promise<GroupSettlement[]> {
    await this.verifyMembership(groupId, userId);

    return this.settlementRepository.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSettlementsForUser(groupId: number, userId: number): Promise<GroupSettlement[]> {
    await this.verifyMembership(groupId, userId);

    return this.settlementRepository.find({
      where: [
        { groupId, fromUserId: userId, isSettled: false },
        { groupId, toUserId: userId, isSettled: false },
      ],
    });
  }

  async settlePayment(settlementId: number, userId: number): Promise<GroupSettlement> {
    const settlement = await this.settlementRepository.findOne({ where: { id: settlementId } });

    if (!settlement) {
      throw new Error('Settlement not found');
    }

    if (settlement.fromUserId !== userId) {
      throw new Error('Only debtor can settle payment');
    }

    settlement.isSettled = true;
    settlement.settledDate = new Date();

    return this.settlementRepository.save(settlement);
  }

  async getGroupBalance(groupId: number, userId: number): Promise<any> {
    await this.verifyMembership(groupId, userId);

    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    const settlements = await this.getSettlementsForUser(groupId, userId);

    let owesAmount = 0;
    let owedAmount = 0;

    for (const settlement of settlements) {
      if (settlement.isSettled) continue;

      if (settlement.fromUserId === userId) {
        owesAmount += Number(settlement.amount);
      } else {
        owedAmount += Number(settlement.amount);
      }
    }

    return {
      owes: owesAmount,
      owed: owedAmount,
      netBalance: owedAmount - owesAmount,
    };
  }

  async getExpenseSummary(groupId: number, userId: number): Promise<any> {
    await this.verifyMembership(groupId, userId);

    const expenses = await this.getGroupExpenses(groupId, userId);
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['members'] });

    if (!group) {
      throw new Error('Group not found');
    }

    const summary = {};
    group.members.forEach(member => {
      summary[member.id] = {
        name: member.id,
        paid: 0,
        owes: 0,
      };
    });

    for (const expense of expenses) {
      summary[expense.paidByUserId].paid += Number(expense.amount);

      const splits = JSON.parse(expense.splits);
      for (const memberId in splits) {
        summary[parseInt(memberId)].owes += splits[memberId];
      }
    }

    return summary;
  }

  // Helper methods
  private async verifyGroupOwner(groupId: number, userId: number): Promise<SharedExpenseGroup> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group || group.ownerId !== userId) {
      throw new Error('Only group owner can perform this action');
    }
    return group;
  }

  private async verifyMembership(groupId: number, userId: number): Promise<void> {
    const isMember = await this.isGroupMember(groupId, userId);
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }
  }

  private async isGroupMember(groupId: number, userId: number): Promise<boolean> {
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['members'] });
    if (!group) return false;

    return group.ownerId === userId || group.members.some(m => m.id === userId);
  }

  private async createOrUpdateSettlement(groupId: number, paidBy: number, memberUserId: number, amount: number): Promise<void> {
    let settlement = await this.settlementRepository.findOne({
      where: {
        groupId,
        fromUserId: memberUserId,
        toUserId: paidBy,
        isSettled: false,
      },
    });

    if (settlement) {
      settlement.amount = Number(settlement.amount) + amount;
    } else {
      settlement = this.settlementRepository.create({
        groupId,
        fromUserId: memberUserId,
        toUserId: paidBy,
        amount,
      });
    }

    await this.settlementRepository.save(settlement);
  }
}
