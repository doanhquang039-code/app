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
exports.TransactionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const pubSub = new graphql_subscriptions_1.PubSub();
let TransactionResolver = class TransactionResolver {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async getTransactions(userId, type, startDate, endDate, limit = 50, offset = 0) {
        const where = { userId };
        if (type) {
            where.type = type;
        }
        if (startDate && endDate) {
            where.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        const [transactions, totalCount] = await this.transactionRepo.findAndCount({
            where,
            take: limit,
            skip: offset,
            order: { date: 'DESC' },
        });
        return {
            edges: transactions.map((t, index) => ({
                node: t,
                cursor: Buffer.from(`${offset + index}`).toString('base64'),
            })),
            pageInfo: {
                hasNextPage: offset + limit < totalCount,
                hasPreviousPage: offset > 0,
                startCursor: transactions.length > 0 ? Buffer.from(`${offset}`).toString('base64') : null,
                endCursor: transactions.length > 0 ? Buffer.from(`${offset + transactions.length - 1}`).toString('base64') : null,
            },
            totalCount,
        };
    }
    async getTransaction(id) {
        return await this.transactionRepo.findOne({ where: { id } });
    }
    async createTransaction(input) {
        const transaction = this.transactionRepo.create({
            ...input,
            date: input.date || new Date(),
        });
        const saved = await this.transactionRepo.save(transaction);
        pubSub.publish('transactionCreated', {
            transactionCreated: saved,
            userId: input.userId,
        });
        return saved;
    }
    async updateTransaction(id, input) {
        await this.transactionRepo.update(id, input);
        const updated = await this.transactionRepo.findOne({ where: { id } });
        if (updated) {
            pubSub.publish('transactionUpdated', {
                transactionUpdated: updated,
                userId: updated.userId,
            });
        }
        return updated;
    }
    async deleteTransaction(id) {
        const transaction = await this.transactionRepo.findOne({ where: { id } });
        const result = await this.transactionRepo.delete(id);
        if (result.affected && result.affected > 0 && transaction) {
            pubSub.publish('transactionDeleted', {
                transactionDeleted: id,
                userId: transaction.userId,
            });
        }
        return result.affected ? result.affected > 0 : false;
    }
    transactionCreated(userId) {
        return pubSub.asyncIterator('transactionCreated');
    }
    transactionUpdated(userId) {
        return pubSub.asyncIterator('transactionUpdated');
    }
    transactionDeleted(userId) {
        return pubSub.asyncIterator('transactionDeleted');
    }
};
exports.TransactionResolver = TransactionResolver;
__decorate([
    (0, graphql_1.Query)('transactions'),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('type')),
    __param(2, (0, graphql_1.Args)('startDate')),
    __param(3, (0, graphql_1.Args)('endDate')),
    __param(4, (0, graphql_1.Args)('limit')),
    __param(5, (0, graphql_1.Args)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Date,
        Date, Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "getTransactions", null);
__decorate([
    (0, graphql_1.Query)('transaction'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "getTransaction", null);
__decorate([
    (0, graphql_1.Mutation)('createTransaction'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "createTransaction", null);
__decorate([
    (0, graphql_1.Mutation)('updateTransaction'),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "updateTransaction", null);
__decorate([
    (0, graphql_1.Mutation)('deleteTransaction'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TransactionResolver.prototype, "deleteTransaction", null);
__decorate([
    (0, graphql_1.Subscription)('transactionCreated', {
        filter: (payload, variables) => {
            return payload.userId === variables.userId;
        },
    }),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransactionResolver.prototype, "transactionCreated", null);
__decorate([
    (0, graphql_1.Subscription)('transactionUpdated', {
        filter: (payload, variables) => {
            return payload.userId === variables.userId;
        },
    }),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransactionResolver.prototype, "transactionUpdated", null);
__decorate([
    (0, graphql_1.Subscription)('transactionDeleted', {
        filter: (payload, variables) => {
            return payload.userId === variables.userId;
        },
    }),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransactionResolver.prototype, "transactionDeleted", null);
exports.TransactionResolver = TransactionResolver = __decorate([
    (0, graphql_1.Resolver)('Transaction'),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionResolver);
//# sourceMappingURL=transaction.resolver.js.map