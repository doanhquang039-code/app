import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCard } from '../../entities/credit-card.entity';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private creditCardRepository: Repository<CreditCard>,
  ) {}

  async create(userId: number, createCreditCardDto: CreateCreditCardDto): Promise<CreditCard> {
    const creditCard = this.creditCardRepository.create({
      ...createCreditCardDto,
      userId,
    });
    return this.creditCardRepository.save(creditCard);
  }

  async findAll(userId: number): Promise<CreditCard[]> {
    return this.creditCardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<CreditCard | null> {
    return this.creditCardRepository.findOne({
      where: { id, userId },
    });
  }

  async update(id: number, userId: number, updateCreditCardDto: UpdateCreditCardDto): Promise<CreditCard | null> {
    await this.creditCardRepository.update(
      { id, userId },
      { ...updateCreditCardDto, updatedAt: new Date() },
    );
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.creditCardRepository.delete({ id, userId });
  }

  async updateBalance(id: number, userId: number, newBalance: number): Promise<CreditCard | null> {
    await this.creditCardRepository.update(
      { id, userId },
      { currentBalance: newBalance, updatedAt: new Date() },
    );
    return this.findOne(id, userId);
  }

  async getAvailableCredit(id: number, userId: number): Promise<number> {
    const card = await this.findOne(id, userId);
    if (!card) return 0;
    return Number(card.creditLimit) - Number(card.currentBalance);
  }

  async getTotalCreditLimit(userId: number): Promise<number> {
    const result = await this.creditCardRepository
      .createQueryBuilder('creditCard')
      .select('SUM(creditCard.creditLimit)', 'total')
      .where('creditCard.userId = :userId', { userId })
      .andWhere('creditCard.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTotalCreditUsage(userId: number): Promise<number> {
    const result = await this.creditCardRepository
      .createQueryBuilder('creditCard')
      .select('SUM(creditCard.currentBalance)', 'total')
      .where('creditCard.userId = :userId', { userId })
      .andWhere('creditCard.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getCreditUtilizationRatio(userId: number): Promise<number> {
    const totalLimit = await this.getTotalCreditLimit(userId);
    const totalUsage = await this.getTotalCreditUsage(userId);

    if (totalLimit === 0) return 0;
    return (totalUsage / totalLimit) * 100;
  }

  async getCardsByType(userId: number, cardType: string): Promise<CreditCard[]> {
    return this.creditCardRepository.find({
      where: { userId, cardType },
    });
  }

  async getUpcomingBillingCycles(userId: number): Promise<CreditCard[]> {
    const today = new Date();
    const currentDay = today.getDate();

    const cards = await this.findAll(userId);
    return cards.filter(card => card.billingCycleDayOfMonth && card.billingCycleDayOfMonth <= currentDay + 7);
  }
}
