import type { Response } from 'express';
import { ExportService } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportExcel(req: any, startDate: string, endDate: string, res: Response): Promise<void>;
    exportPDF(req: any, startDate: string, endDate: string, res: Response): Promise<void>;
    exportCSV(req: any, startDate: string, endDate: string, res: Response): Promise<void>;
}
