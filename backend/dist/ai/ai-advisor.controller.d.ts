import { AIAdvisorService } from './ai-advisor.service';
declare class ChatMessageDto {
    message: string;
}
export declare class AIAdvisorController {
    private readonly aiAdvisorService;
    constructor(aiAdvisorService: AIAdvisorService);
    getInsights(req: any): Promise<import("./ai-advisor.service").AIInsight[]>;
    chat(req: any, dto: ChatMessageDto): Promise<{
        response: string;
    }>;
}
export {};
