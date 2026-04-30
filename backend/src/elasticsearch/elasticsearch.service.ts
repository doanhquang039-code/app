import { Injectable } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchService {
  private readonly index = 'transactions';

  constructor(private readonly elasticsearchService: NestElasticsearchService) {}

  async indexTransaction(transaction: any): Promise<void> {
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

  async searchTransactions(userId: number, query: string): Promise<any[]> {
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

    return hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));
  }

  async advancedSearch(userId: number, filters: any): Promise<any[]> {
    const must: any[] = [{ match: { userId } }];

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

    return hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: this.index,
      id,
    });
  }

  async updateTransaction(id: string, transaction: any): Promise<void> {
    await this.elasticsearchService.update({
      index: this.index,
      id,
      doc: transaction,
    });
  }

  async getAggregations(userId: number): Promise<any> {
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
}
