import { NetWorthService } from './net-worth.service';
import { CaptureSnapshotDto } from './dto/capture-snapshot.dto';
export declare class NetWorthController {
    private readonly netWorthService;
    constructor(netWorthService: NetWorthService);
    current(req: {
        user: {
            userId: number;
        };
    }): Promise<{
        walletTotal: number;
        bankTotal: number;
        investmentTotal: number;
        receivablesTotal: number;
        borrowingsTotal: number;
        creditCardDebtTotal: number;
        netWorth: number;
        currency: "VND";
    }>;
    capture(req: {
        user: {
            userId: number;
        };
    }, body: CaptureSnapshotDto): Promise<import("../../entities/net-worth-snapshot.entity").NetWorthSnapshot>;
    list(req: {
        user: {
            userId: number;
        };
    }, from?: string, to?: string, latest?: string): Promise<import("../../entities/net-worth-snapshot.entity").NetWorthSnapshot[]>;
}
