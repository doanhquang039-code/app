import { Repository } from 'typeorm';
import { CreditCard } from '../../entities/credit-card.entity';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';
export declare class CreditCardsService {
    private creditCardRepository;
    constructor(creditCardRepository: Repository<CreditCard>);
    create(userId: number, createCreditCardDto: CreateCreditCardDto): Promise<CreditCard>;
    findAll(userId: number): Promise<CreditCard[]>;
    findOne(id: number, userId: number): Promise<CreditCard | null>;
    update(id: number, userId: number, updateCreditCardDto: UpdateCreditCardDto): Promise<CreditCard | null>;
    remove(id: number, userId: number): Promise<void>;
    updateBalance(id: number, userId: number, newBalance: number): Promise<CreditCard | null>;
    getAvailableCredit(id: number, userId: number): Promise<number>;
    getTotalCreditLimit(userId: number): Promise<number>;
    getTotalCreditUsage(userId: number): Promise<number>;
    getCreditUtilizationRatio(userId: number): Promise<number>;
    getCardsByType(userId: number, cardType: string): Promise<CreditCard[]>;
    getUpcomingBillingCycles(userId: number): Promise<CreditCard[]>;
}
