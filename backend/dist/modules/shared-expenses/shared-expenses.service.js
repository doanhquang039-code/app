"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedExpensesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shared_expense_entity_1 = require("../../entities/shared-expense.entity");
const user_entity_1 = require("../../entities/user.entity");
let SharedExpensesService = class SharedExpensesService {
    groupRepository;
    expenseRepository;
    settlementRepository;
    userRepository;
    constructor(groupRepository, expenseRepository, settlementRepository, userRepository) {
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.userRepository = userRepository;
    }
    async createGroup(ownerId, createGroupDto) {
        const group = this.groupRepository.create({
            ...createGroupDto,
            ownerId,
        });
        const savedGroup = await this.groupRepository.save(group);
        const ownerUser = await this.userRepository.findOne({ where: { id: ownerId } });
        if (ownerUser) {
            savedGroup.members = [ownerUser];
            return this.groupRepository.save(savedGroup);
        }
        return savedGroup;
    }
    async getGroupsForUser(userId) {
        const groups = await this.groupRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.members', 'members')
            .where('group.ownerId = :userId', { userId })
            .orWhere(':userId IN (SELECT userId FROM group_members WHERE groupId = group.id)', { userId })
            .getMany();
        return groups;
    }
    async getGroupDetails(groupId, userId) {
        return this.groupRepository.findOne({
            where: { id: groupId },
            relations: ['members', 'owner'],
        });
    }
    async addMemberToGroup(groupId, newMemberId, requestingUserId) {
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
    async removeMemberFromGroup(groupId, memberId, requestingUserId) {
        const group = await this.verifyGroupOwner(groupId, requestingUserId);
        group.members = group.members.filter(m => m.id !== memberId);
        return this.groupRepository.save(group);
    }
    async updateGroup(groupId, userId, updateGroupDto) {
        const group = await this.verifyGroupOwner(groupId, userId);
        Object.assign(group, updateGroupDto);
        return this.groupRepository.save(group);
    }
    async deleteGroup(groupId, userId) {
        await this.verifyGroupOwner(groupId, userId);
        await this.groupRepository.delete({ id: groupId });
    }
    async createSharedExpense(userId, groupId, createExpenseDto) {
        const expense = this.expenseRepository.create({
            ...createExpenseDto,
            groupId,
            paidByUserId: userId,
        });
        const savedExpense = await this.expenseRepository.save(expense);
        const splits = JSON.parse(createExpenseDto.splits);
        for (const memberUserId in splits) {
            if (memberUserId !== userId.toString()) {
                await this.createOrUpdateSettlement(groupId, userId, parseInt(memberUserId), splits[memberUserId]);
            }
        }
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (group) {
            group.totalAmount = Number(group.totalAmount) + Number(createExpenseDto.amount);
            await this.groupRepository.save(group);
        }
        return savedExpense;
    }
    async getGroupExpenses(groupId, userId) {
        const group = await this.getGroupDetails(groupId, userId);
        if (!group) {
            throw new Error('Access denied');
        }
        return this.expenseRepository.find({
            where: { groupId },
            order: { createdAt: 'DESC' },
        });
    }
    async getExpenseDetails(expenseId, userId) {
        const expense = await this.expenseRepository.findOne({
            where: { id: expenseId },
            relations: ['group', 'paidByUser'],
        });
        if (!expense)
            throw new Error('Expense not found');
        const isMember = await this.isGroupMember(expense.groupId, userId);
        if (!isMember)
            throw new Error('Access denied');
        return expense;
    }
    async deleteExpense(expenseId, userId) {
        const expense = await this.getExpenseDetails(expenseId, userId);
        if (expense.paidByUserId !== userId) {
            throw new Error('Only expense creator can delete');
        }
        await this.settlementRepository.delete({
            groupId: expense.groupId,
        });
        const group = await this.groupRepository.findOne({ where: { id: expense.groupId } });
        if (group) {
            group.totalAmount = Number(group.totalAmount) - Number(expense.amount);
            await this.groupRepository.save(group);
        }
        await this.expenseRepository.delete({ id: expenseId });
    }
    async getSettlementsForGroup(groupId, userId) {
        await this.verifyMembership(groupId, userId);
        return this.settlementRepository.find({
            where: { groupId },
            order: { createdAt: 'DESC' },
        });
    }
    async getSettlementsForUser(groupId, userId) {
        await this.verifyMembership(groupId, userId);
        return this.settlementRepository.find({
            where: [
                { groupId, fromUserId: userId, isSettled: false },
                { groupId, toUserId: userId, isSettled: false },
            ],
        });
    }
    async settlePayment(settlementId, userId) {
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
    async getGroupBalance(groupId, userId) {
        await this.verifyMembership(groupId, userId);
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error('Group not found');
        }
        const settlements = await this.getSettlementsForUser(groupId, userId);
        let owesAmount = 0;
        let owedAmount = 0;
        for (const settlement of settlements) {
            if (settlement.isSettled)
                continue;
            if (settlement.fromUserId === userId) {
                owesAmount += Number(settlement.amount);
            }
            else {
                owedAmount += Number(settlement.amount);
            }
        }
        return {
            owes: owesAmount,
            owed: owedAmount,
            netBalance: owedAmount - owesAmount,
        };
    }
    async getExpenseSummary(groupId, userId) {
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
    async verifyGroupOwner(groupId, userId) {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group || group.ownerId !== userId) {
            throw new Error('Only group owner can perform this action');
        }
        return group;
    }
    async verifyMembership(groupId, userId) {
        const isMember = await this.isGroupMember(groupId, userId);
        if (!isMember) {
            throw new Error('User is not a member of this group');
        }
    }
    async isGroupMember(groupId, userId) {
        const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['members'] });
        if (!group)
            return false;
        return group.ownerId === userId || group.members.some(m => m.id === userId);
    }
    async createOrUpdateSettlement(groupId, paidBy, memberUserId, amount) {
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
        }
        else {
            settlement = this.settlementRepository.create({
                groupId,
                fromUserId: memberUserId,
                toUserId: paidBy,
                amount,
            });
        }
        await this.settlementRepository.save(settlement);
    }
};
exports.SharedExpensesService = SharedExpensesService;
exports.SharedExpensesService = SharedExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shared_expense_entity_1.SharedExpenseGroup)),
    __param(1, (0, typeorm_1.InjectRepository)(shared_expense_entity_1.SharedExpense)),
    __param(2, (0, typeorm_1.InjectRepository)(shared_expense_entity_1.GroupSettlement)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SharedExpensesService);
//# sourceMappingURL=shared-expenses.service.js.map