import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment, InvestmentTransaction } from '../../entities/investment.entity';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepo: Repository<Investment>,
    @InjectRepository(InvestmentTransaction)
    private txRepo: Repository<InvestmentTransaction>,
  ) {}

  async findAll(userId: number): Promise<Investment[]> {
    return this.investmentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number, userId: number): Promise<Investment | null> {
    return this.investmentRepo.findOne({ where: { id, userId } });
  }

  async create(userId: number, data: Partial<Investment>): Promise<Investment> {
    const investment = this.investmentRepo.create({ ...data, userId });
    if (investment.currentPrice && investment.quantity) {
      investment.currentValue = Number(investment.currentPrice) * Number(investment.quantity);
      investment.profitLoss = investment.currentValue - Number(investment.totalInvested);
      investment.profitLossPercentage = Number(investment.totalInvested) > 0
        ? (investment.profitLoss / Number(investment.totalInvested)) * 100 : 0;
    }
    return this.investmentRepo.save(investment);
  }

  async update(id: number, userId: number, data: Partial<Investment>): Promise<Investment> {
    if (data.currentPrice) {
      const existing = await this.findOne(id, userId);
      if (existing) {
        const qty = data.quantity || existing.quantity;
        data.currentValue = Number(data.currentPrice) * Number(qty);
        data.profitLoss = data.currentValue - Number(existing.totalInvested);
        data.profitLossPercentage = Number(existing.totalInvested) > 0
          ? (data.profitLoss / Number(existing.totalInvested)) * 100 : 0;
      }
    }
    await this.investmentRepo.update({ id, userId }, data);
    const updated = await this.findOne(id, userId);
    if (!updated) throw new NotFoundException('Không tìm thấy khoản đầu tư');
    return updated;
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.investmentRepo.delete({ id, userId });
  }

  async getPortfolioSummary(userId: number) {
    const investments = await this.findAll(userId);
    const holding = investments.filter(i => i.status === 'holding');
    const totalInvested = holding.reduce((s, i) => s + Number(i.totalInvested), 0);
    const totalCurrentValue = holding.reduce((s, i) => s + Number(i.currentValue || i.totalInvested), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    const byType = {};
    holding.forEach(i => {
      if (!byType[i.type]) byType[i.type] = { count: 0, invested: 0, currentValue: 0 };
      byType[i.type].count++;
      byType[i.type].invested += Number(i.totalInvested);
      byType[i.type].currentValue += Number(i.currentValue || i.totalInvested);
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
      holdingCount: holding.length,
      soldCount: investments.filter(i => i.status === 'sold').length,
      byType,
    };
  }

  // Investment Transactions
  async getTransactions(investmentId: number, userId: number): Promise<InvestmentTransaction[]> {
    return this.txRepo.find({ where: { investmentId, userId }, order: { transactionDate: 'DESC' } });
  }

  async addTransaction(investmentId: number, userId: number, data: Partial<InvestmentTransaction>): Promise<InvestmentTransaction> {
    const tx = this.txRepo.create({ ...data, investmentId, userId });
    return this.txRepo.save(tx);
  }
}
