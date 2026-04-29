"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const export_import_service_1 = require("./export-import.service");
const export_data_dto_1 = require("./dto/export-data.dto");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path = __importStar(require("path"));
let ExportImportController = class ExportImportController {
    exportImportService;
    constructor(exportImportService) {
        this.exportImportService = exportImportService;
    }
    async exportData(req, dto) {
        return await this.exportImportService.exportData(req.user.userId, dto);
    }
    async getExportHistory(req) {
        return await this.exportImportService.getExportHistory(req.user.userId);
    }
    async downloadExport(req, exportId, res) {
        const { filePath, fileName } = await this.exportImportService.downloadExport(req.user.userId, exportId);
        res.download(filePath, fileName);
    }
    async importData(req, file, dataType) {
        return await this.exportImportService.importData(req.user.userId, file, dataType);
    }
    async cleanupOldExports() {
        const deletedCount = await this.exportImportService.cleanupOldExports();
        return {
            success: true,
            message: `Đã xóa ${deletedCount} file hết hạn`,
            deletedCount,
        };
    }
};
exports.ExportImportController = ExportImportController;
__decorate([
    (0, common_1.Post)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Xuất dữ liệu ra file (Excel, CSV, PDF, JSON)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, export_data_dto_1.ExportDataDto]),
    __metadata("design:returntype", Promise)
], ExportImportController.prototype, "exportData", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch sử xuất file' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportImportController.prototype, "getExportHistory", null);
__decorate([
    (0, common_1.Get)('download/:exportId'),
    (0, swagger_1.ApiOperation)({ summary: 'Tải file đã xuất' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('exportId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], ExportImportController.prototype, "downloadExport", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiOperation)({ summary: 'Nhập dữ liệu từ file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                dataType: {
                    type: 'string',
                    enum: ['TRANSACTIONS', 'BUDGETS', 'SAVINGS_GOALS', 'BILLS'],
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `import-${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedExtensions = ['.xlsx', '.xls', '.csv', '.json'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowedExtensions.includes(ext)) {
                cb(null, true);
            }
            else {
                cb(new Error('Chỉ chấp nhận file Excel, CSV hoặc JSON'), false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('dataType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ExportImportController.prototype, "importData", null);
__decorate([
    (0, common_1.Delete)('cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa các file xuất đã hết hạn (Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExportImportController.prototype, "cleanupOldExports", null);
exports.ExportImportController = ExportImportController = __decorate([
    (0, swagger_1.ApiTags)('Export/Import'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('export-import'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [export_import_service_1.ExportImportService])
], ExportImportController);
//# sourceMappingURL=export-import.controller.js.map