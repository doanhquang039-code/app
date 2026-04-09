import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';
export declare class CreditCardsController {
    private readonly creditCardsService;
    constructor(creditCardsService: CreditCardsService);
    create(req: any, createCreditCardDto: CreateCreditCardDto): Promise<import("../../entities/credit-card.entity").CreditCard>;
    findAll(req: any): Promise<import("../../entities/credit-card.entity").CreditCard[]>;
    getTotalCreditLimit(req: any): Promise<{
        totalLimit: number;
    }>;
    getTotalCreditUsage(req: any): Promise<{
        totalUsage: number;
    }>;
    getCreditUtilizationRatio(req: any): Promise<{
        utilizationRatio: string;
    }>;
    getUpcomingBillingCycles(req: any): Promise<{
        upcomingCycles: import("../../entities/credit-card.entity").CreditCard[];
    }>;
    findOne(id: string, req: any): Promise<import("../../entities/credit-card.entity").CreditCard | null>;
    getAvailableCredit(id: string, req: any): Promise<{
        availableCredit: number;
    }>;
    update(id: string, req: any, updateCreditCardDto: UpdateCreditCardDto): Promise<import("../../entities/credit-card.entity").CreditCard | null>;
    remove(id: string, req: any): Promise<void>;
    updateBalance(id: string, req: any, { balance }: {
        balance: number;
    }): Promise<import("../../entities/credit-card.entity").CreditCard | null>;
    getCardsByType(cardType: string, req: any): Promise<import("../../entities/credit-card.entity").CreditCard[]>;
}
