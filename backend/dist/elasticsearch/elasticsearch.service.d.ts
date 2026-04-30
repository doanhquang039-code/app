import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
export declare class ElasticsearchService {
    private readonly elasticsearchService;
    private readonly index;
    constructor(elasticsearchService: NestElasticsearchService);
    indexTransaction(transaction: any): Promise<void>;
    searchTransactions(userId: number, query: string): Promise<any[]>;
    advancedSearch(userId: number, filters: any): Promise<any[]>;
    deleteTransaction(id: string): Promise<void>;
    updateTransaction(id: string, transaction: any): Promise<void>;
    getAggregations(userId: number): Promise<any>;
}
