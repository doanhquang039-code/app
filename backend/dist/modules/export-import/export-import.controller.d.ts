import type { Response } from 'express';
import { ExportImportService } from './export-import.service';
import { ExportDataDto, DataType } from './dto/export-data.dto';
export declare class ExportImportController {
    private readonly exportImportService;
    constructor(exportImportService: ExportImportService);
    exportData(req: any, dto: ExportDataDto): Promise<import("../../entities/export-history.entity").ExportHistory>;
    getExportHistory(req: any): Promise<import("../../entities/export-history.entity").ExportHistory[]>;
    downloadExport(req: any, exportId: number, res: Response): Promise<void>;
    importData(req: any, file: Express.Multer.File, dataType: DataType): Promise<any>;
    cleanupOldExports(): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>;
}
