import { SearchService } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    searchTransactions(userId: number, filters: any): Promise<any>;
    advancedSearch(userId: number, searchParams: any): Promise<any>;
    getFilterOptions(userId: number): Promise<any>;
}
