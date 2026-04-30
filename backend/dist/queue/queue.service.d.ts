import type { Queue } from 'bull';
export declare class QueueService {
    private emailQueue;
    private notificationQueue;
    private reportQueue;
    private analyticsQueue;
    constructor(emailQueue: Queue, notificationQueue: Queue, reportQueue: Queue, analyticsQueue: Queue);
    sendWelcomeEmail(userId: number, email: string): Promise<void>;
    sendBudgetAlert(userId: number, budgetData: any): Promise<void>;
    sendMonthlyReport(userId: number): Promise<void>;
    sendPushNotification(userId: number, notification: any): Promise<void>;
    sendInAppNotification(userId: number, notification: any): Promise<void>;
    generateExcelReport(userId: number, params: any): Promise<void>;
    generatePDFReport(userId: number, params: any): Promise<void>;
    calculateUserAnalytics(userId: number): Promise<void>;
    calculateGlobalAnalytics(): Promise<void>;
    updateLeaderboard(): Promise<void>;
    getJobCounts(queueName: string): Promise<any>;
    getActiveJobs(queueName: string): Promise<any[]>;
    getFailedJobs(queueName: string): Promise<any[]>;
    retryFailedJobs(queueName: string): Promise<void>;
    cleanQueue(queueName: string, grace?: number): Promise<void>;
    private getQueue;
}
