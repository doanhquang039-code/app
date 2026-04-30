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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const ExcelJS = __importStar(require("exceljs"));
let ExportService = class ExportService {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async exportToExcel(userId, startDate, endDate) {
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { date: 'DESC' },
        });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');
        worksheet.columns = [
            { header: 'Ngày', key: 'date', width: 15 },
            { header: 'Loại', key: 'type', width: 12 },
            { header: 'Danh mục', key: 'category', width: 20 },
            { header: 'Số tiền', key: 'amount', width: 15 },
            { header: 'Ghi chú', key: 'note', width: 30 },
        ];
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4CAF50' },
        };
        transactions.forEach((t) => {
            worksheet.addRow({
                date: new Date(t.date).toLocaleDateString('vi-VN'),
                type: t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                category: t.categoryId || 'Khác',
                amount: Number(t.amount).toLocaleString('vi-VN'),
                note: t.note || '',
            });
        });
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        worksheet.addRow([]);
        worksheet.addRow(['Tổng thu nhập', '', '', totalIncome.toLocaleString('vi-VN')]);
        worksheet.addRow(['Tổng chi tiêu', '', '', totalExpense.toLocaleString('vi-VN')]);
        worksheet.addRow([
            'Số dư',
            '',
            '',
            (totalIncome - totalExpense).toLocaleString('vi-VN'),
        ]);
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportToPDF(userId, startDate, endDate) {
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { date: 'DESC' },
        });
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const pdfContent = `
BÁO CÁO TÀI CHÍNH
Từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}

GIAO DỊCH:
${transactions.map((t) => `${new Date(t.date).toLocaleDateString('vi-VN')} - ${t.type === 'income' ? 'Thu' : 'Chi'} - ${Number(t.amount).toLocaleString('vi-VN')}đ - ${t.note || ''}`).join('\n')}

TỔNG KẾT:
Tổng thu nhập: ${totalIncome.toLocaleString('vi-VN')}đ
Tổng chi tiêu: ${totalExpense.toLocaleString('vi-VN')}đ
Số dư: ${(totalIncome - totalExpense).toLocaleString('vi-VN')}đ
    `;
        return Buffer.from(pdfContent, 'utf-8');
    }
    async exportToCSV(userId, startDate, endDate) {
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { date: 'DESC' },
        });
        let csv = 'Ngày,Loại,Danh mục,Số tiền,Ghi chú\n';
        transactions.forEach((t) => {
            csv += `${new Date(t.date).toLocaleDateString('vi-VN')},`;
            csv += `${t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'},`;
            csv += `${t.categoryId || 'Khác'},`;
            csv += `${Number(t.amount)},`;
            csv += `"${(t.note || '').replace(/"/g, '""')}"\n`;
        });
        return csv;
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExportService);
//# sourceMappingURL=export.service.js.map