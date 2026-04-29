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
exports.VoiceCommandsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const voice_command_entity_1 = require("../../entities/voice-command.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let VoiceCommandsService = class VoiceCommandsService {
    voiceRepo;
    transactionRepo;
    constructor(voiceRepo, transactionRepo) {
        this.voiceRepo = voiceRepo;
        this.transactionRepo = transactionRepo;
    }
    async processCommand(userId, text, language = 'vi') {
        const voiceCommand = this.voiceRepo.create({
            userId,
            originalText: text,
            language,
            status: 'PROCESSING',
        });
        const savedCommand = await this.voiceRepo.save(voiceCommand);
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
        }
        catch (error) {
            savedCommand.status = 'FAILED';
            savedCommand.errorMessage = error.message;
            await this.voiceRepo.save(savedCommand);
            throw error;
        }
    }
    parseCommand(text, language) {
        const lowerText = text.toLowerCase();
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
        if (lowerText.includes('balance') || lowerText.includes('số dư') || lowerText.includes('bao nhiêu')) {
            return {
                intent: 'GET_BALANCE',
                entities: {},
                confidence: 90,
            };
        }
        if (lowerText.includes('budget') || lowerText.includes('ngân sách')) {
            return {
                intent: 'VIEW_BUDGET',
                entities: {},
                confidence: 85,
            };
        }
        return {
            intent: 'UNKNOWN',
            entities: {},
            confidence: 0,
        };
    }
    async executeIntent(userId, intent, entities) {
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
    async addTransaction(userId, entities) {
        const transaction = this.transactionRepo.create({
            userId,
            type: entities.type,
            amount: entities.amount,
            date: new Date(),
        });
        const saved = await this.transactionRepo.save(transaction);
        return {
            action: 'Transaction created',
            entityId: saved.id,
            entityType: 'TRANSACTION',
            response: `Đã thêm ${entities.type === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'} ${entities.amount.toLocaleString()}đ`,
        };
    }
    async getBalance(userId) {
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
    async viewBudget(userId) {
        return {
            action: 'Budget viewed',
            response: 'Đang hiển thị ngân sách của bạn',
        };
    }
    async getHistory(userId, limit = 50) {
        return await this.voiceRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findOne(userId, id) {
        const command = await this.voiceRepo.findOne({
            where: { id, userId },
        });
        if (!command) {
            throw new common_1.NotFoundException('Voice command not found');
        }
        return command;
    }
    getSupportedIntents() {
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
};
exports.VoiceCommandsService = VoiceCommandsService;
exports.VoiceCommandsService = VoiceCommandsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(voice_command_entity_1.VoiceCommand)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VoiceCommandsService);
//# sourceMappingURL=voice-commands.service.js.map