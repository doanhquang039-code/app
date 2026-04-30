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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
let ElasticsearchService = class ElasticsearchService {
    elasticsearchService;
    index = 'transactions';
    constructor(elasticsearchService) {
        this.elasticsearchService = elasticsearchService;
    }
    async indexTransaction(transaction) {
        await this.elasticsearchService.index({
            index: this.index,
            id: transaction.id.toString(),
            document: {
                userId: transaction.userId,
                type: transaction.type,
                amount: transaction.amount,
                categoryId: transaction.categoryId,
                note: transaction.note,
                date: transaction.date,
                createdAt: transaction.createdAt,
            },
        });
    }
    async searchTransactions(userId, query) {
        const { hits } = await this.elasticsearchService.search({
            index: this.index,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { userId } },
                            {
                                multi_match: {
                                    query,
                                    fields: ['note', 'categoryId'],
                                    fuzziness: 'AUTO',
                                },
                            },
                        ],
                    },
                },
                sort: [{ date: { order: 'desc' } }],
                size: 50,
            },
        });
        return hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
            score: hit._score,
        }));
    }
    async advancedSearch(userId, filters) {
        const must = [{ match: { userId } }];
        if (filters.type) {
            must.push({ match: { type: filters.type } });
        }
        if (filters.minAmount || filters.maxAmount) {
            must.push({
                range: {
                    amount: {
                        gte: filters.minAmount || 0,
                        lte: filters.maxAmount || Number.MAX_SAFE_INTEGER,
                    },
                },
            });
        }
        if (filters.startDate || filters.endDate) {
            must.push({
                range: {
                    date: {
                        gte: filters.startDate,
                        lte: filters.endDate,
                    },
                },
            });
        }
        if (filters.query) {
            must.push({
                multi_match: {
                    query: filters.query,
                    fields: ['note', 'categoryId'],
                    fuzziness: 'AUTO',
                },
            });
        }
        const { hits } = await this.elasticsearchService.search({
            index: this.index,
            body: {
                query: { bool: { must } },
                sort: [{ date: { order: 'desc' } }],
                size: filters.limit || 50,
                from: filters.offset || 0,
            },
        });
        return hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
            score: hit._score,
        }));
    }
    async deleteTransaction(id) {
        await this.elasticsearchService.delete({
            index: this.index,
            id,
        });
    }
    async updateTransaction(id, transaction) {
        await this.elasticsearchService.update({
            index: this.index,
            id,
            doc: transaction,
        });
    }
    async getAggregations(userId) {
        const { aggregations } = await this.elasticsearchService.search({
            index: this.index,
            body: {
                query: { match: { userId } },
                size: 0,
                aggs: {
                    by_type: {
                        terms: { field: 'type.keyword' },
                        aggs: {
                            total_amount: { sum: { field: 'amount' } },
                        },
                    },
                    by_category: {
                        terms: { field: 'categoryId.keyword', size: 10 },
                        aggs: {
                            total_amount: { sum: { field: 'amount' } },
                        },
                    },
                    by_month: {
                        date_histogram: {
                            field: 'date',
                            calendar_interval: 'month',
                        },
                        aggs: {
                            total_amount: { sum: { field: 'amount' } },
                        },
                    },
                },
            },
        });
        return aggregations;
    }
};
exports.ElasticsearchService = ElasticsearchService;
exports.ElasticsearchService = ElasticsearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService])
], ElasticsearchService);
//# sourceMappingURL=elasticsearch.service.js.map