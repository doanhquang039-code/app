import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoiceCommand } from '../../entities/voice-command.entity';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class VoiceCommandsService {
  constructor(
    @InjectRepository(VoiceCommand)
    private voiceRepo: Repository<VoiceCommand>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async processCommand(userId: number, text: string, language: string = 'vi'): Promise<any> {
    const voiceCommand = this.voiceRepo.create({
      userId,
      originalText: text,
      language,
      status: 'PROCESSING',
    });

    const savedCommand = await this.voiceRepo.save(voiceCommand) as unknown as VoiceCommand;

    try {
      const { intent, entities, confidence } = this.parseCommand(text, language);

      savedCommand.intent = intent;
      savedCommand.entities = JSON.stringify(entities);
      savedCommand.confidence = confidence;

      const result = await this.executeIntent(userId, intent, entities);

      savedCommand.status = 'COMPLETED';
      savedCommand.actionTaken = result.action;
      savedCommand.relatedEntityId = result.entityId;
      savedCommand.relatedEntityType = result.entityType;
      savedCommand.response = result.response;

      await this.voiceRepo.save(savedCommand);

      return {
        success: true,
        intent,
        entities,
        confidence,
        ...result,
      };
    } catch (error) {
      savedCommand.status = 'FAILED';
      savedCommand.errorMessage = error.message;
      await this.voiceRepo.save(savedCommand);
      throw error;
    }
  }

  private parseCommand(text: string, language: string): any {
    const lowerText = text.toLowerCase();

    // ADD_TRANSACTION intent
    if (lowerText.includes('add') || lowerText.includes('thêm') || lowerText.includes('chi')) {
      const amountMatch = lowerText.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

      let type = 'EXPENSE';
      if (lowerText.includes('income') || lowerText.includes('thu')) {
        type = 'INCOME';
      }

      return {
        intent: 'ADD_TRANSACTION',
        entities: {
          amount,
          type,
          description: text,
        },
        confidence: 85,
      };
    }

    // GET_BALANCE intent
    if (lowerText.includes('balance') || lowerText.includes('số dư') || lowerText.includes('bao nhiêu')) {
      return {
        intent: 'GET_BALANCE',
        entities: {},
        confidence: 90,
      };
    }

    // VIEW_BUDGET intent
    if (lowerText.includes('budget') || lowerText.includes('ngân sách')) {
      return {
        intent: 'VIEW_BUDGET',
        entities: {},
        confidence: 85,
      };
    }

    // Default
    return {
      intent: 'UNKNOWN',
      entities: {},
      confidence: 0,
    };
  }

  private async executeIntent(userId: number, intent: string, entities: any): Promise<any> {
    switch (intent) {
      case 'ADD_TRANSACTION':
        return await this.addTransaction(userId, entities);

      case 'GET_BALANCE':
        return await this.getBalance(userId);

      case 'VIEW_BUDGET':
        return await this.viewBudget(userId);

      default:
        return {
          action: 'NONE',
          response: 'Xin lỗi, tôi không hiểu lệnh của bạn',
        };
    }
  }

  private async addTransaction(userId: number, entities: any): Promise<any> {
    const transaction = this.transactionRepo.create({
      userId,
      type: entities.type,
      amount: entities.amount,
      date: new Date(),
    });

    const saved = await this.transactionRepo.save(transaction) as unknown as Transaction;

    return {
      action: 'Transaction created',
      entityId: saved.id,
      entityType: 'TRANSACTION',
      response: `Đã thêm ${entities.type === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'} ${entities.amount.toLocaleString()}đ`,
    };
  }

  private async getBalance(userId: number): Promise<any> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
    });

    const balance = transactions.reduce((sum, txn) => {
      const amount = parseFloat(txn.amount.toString());
      return txn.type === 'INCOME' ? sum + amount : sum - amount;
    }, 0);

    return {
      action: 'Balance retrieved',
      response: `Số dư hiện tại của bạn là ${Math.round(balance).toLocaleString()}đ`,
    };
  }

  private async viewBudget(userId: number): Promise<any> {
    return {
      action: 'Budget viewed',
      response: 'Đang hiển thị ngân sách của bạn',
    };
  }

  async getHistory(userId: number, limit: number = 50): Promise<VoiceCommand[]> {
    return await this.voiceRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(userId: number, id: number): Promise<VoiceCommand> {
    const command = await this.voiceRepo.findOne({
      where: { id, userId },
    });

    if (!command) {
      throw new NotFoundException('Voice command not found');
    }

    return command;
  }

  getSupportedIntents(): any[] {
    return [
      {
        intent: 'ADD_TRANSACTION',
        description: 'Thêm giao dịch',
        examples: [
          'Add expense 50000 for coffee',
          'Thêm chi tiêu 50000 cho cà phê',
        ],
      },
      {
        intent: 'GET_BALANCE',
        description: 'Xem số dư',
        examples: [
          "What's my balance?",
          'Số dư của tôi là bao nhiêu?',
        ],
      },
      {
        intent: 'VIEW_BUDGET',
        description: 'Xem ngân sách',
        examples: [
          'Show my budget',
          'Hiển thị ngân sách',
        ],
      },
    ];
  }
}
