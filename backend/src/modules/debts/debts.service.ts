import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt, DebtPayment } from '../../entities/debt.entity';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtRepo: Repository<Debt>,
    @InjectRepository(DebtPayment)
    private paymentRepo: Repository<DebtPayment>,
  ) {}

  async findAll(userId: number): Promise<Debt[]> {
    return this.debtRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number, userId: number): Promise<Debt | null> {
    return this.debtRepo.findOne({ where: { id, userId } });
  }

  async create(userId: number, data: Partial<Debt>): Promise<Debt> {
    const debt = this.debtRepo.create({ ...data, userId });
    return this.debtRepo.save(debt);
  }

  async update(id: number, userId: number, data: Partial<Debt>): Promise<Debt> {
    await this.debtRepo.update({ id, userId }, data);
    const updated = await this.findOne(id, userId);
    if (!updated) throw new NotFoundException('Không tìm thấy khoản nợ');
    return updated;
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.debtRepo.delete({ id, userId });
  }

  async getSummary(userId: number) {
    const debts = await this.findAll(userId);
    const totalLent = debts.filter(d => d.type === 'lend').reduce((s, d) => s + Number(d.totalAmount), 0);
    const totalBorrowed = debts.filter(d => d.type === 'borrow').reduce((s, d) => s + Number(d.totalAmount), 0);
    const totalLentPaid = debts.filter(d => d.type === 'lend').reduce((s, d) => s + Number(d.paidAmount), 0);
    const totalBorrowedPaid = debts.filter(d => d.type === 'borrow').reduce((s, d) => s + Number(d.paidAmount), 0);
    const activeDebts = debts.filter(d => d.status === 'active').length;
    const overdueDebts = debts.filter(d => d.status === 'overdue' || (d.dueDate && new Date(d.dueDate) < new Date() && d.status === 'active')).length;

    return {
      totalLent,
      totalBorrowed,
      totalLentPaid,
      totalBorrowedPaid,
      remainingLent: totalLent - totalLentPaid,
      remainingBorrowed: totalBorrowed - totalBorrowedPaid,
      activeDebts,
      overdueDebts,
      totalDebts: debts.length,
    };
  }

  // Payments
  async getPayments(debtId: number, userId: number): Promise<DebtPayment[]> {
    return this.paymentRepo.find({ where: { debtId, userId }, order: { paymentDate: 'DESC' } });
  }

  async addPayment(debtId: number, userId: number, data: Partial<DebtPayment>): Promise<DebtPayment> {
    const payment = this.paymentRepo.create({ ...data, debtId, userId });
    const saved = await this.paymentRepo.save(payment);

    // Update debt paidAmount
    const debt = await this.findOne(debtId, userId);
    if (debt) {
      const newPaidAmount = Number(debt.paidAmount) + Number(data.amount);
      const updateData: Partial<Debt> = { paidAmount: newPaidAmount };
      if (newPaidAmount >= Number(debt.totalAmount)) {
        updateData.status = 'paid';
      }
      await this.debtRepo.update({ id: debtId }, updateData);
    }
    return saved;
  }
}
