import { Repository } from 'typeorm';
import { VoiceCommand } from '../../entities/voice-command.entity';
import { Transaction } from '../../entities/transaction.entity';
export declare class VoiceCommandsService {
    private voiceRepo;
    private transactionRepo;
    constructor(voiceRepo: Repository<VoiceCommand>, transactionRepo: Repository<Transaction>);
    processCommand(userId: number, text: string, language?: string): Promise<any>;
    private parseCommand;
    private executeIntent;
    private addTransaction;
    private getBalance;
    private viewBudget;
    getHistory(userId: number, limit?: number): Promise<VoiceCommand[]>;
    findOne(userId: number, id: number): Promise<VoiceCommand>;
    getSupportedIntents(): any[];
}
