import { AdvancedDashboardService } from './advanced-dashboard.service';
export declare class AdvancedDashboardController {
    private advancedDashboardService;
    constructor(advancedDashboardService: AdvancedDashboardService);
    getAdvancedDashboard(userId: number): Promise<any>;
    getRealTimeStats(userId: number): Promise<any>;
}
