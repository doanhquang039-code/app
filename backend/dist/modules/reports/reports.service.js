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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const ExcelJS = __importStar(require("exceljs"));
const PdfPrinter = require('pdfmake');
let ReportsService = class ReportsService {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async getTransactions(userId, from, to) {
        return this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(new Date(from), new Date(to)),
            },
            relations: ['category'],
            order: { date: 'DESC' },
        });
    }
    async exportExcel(userId, from, to) {
        const transactions = await this.getTransactions(userId, from, to);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Báo cáo chi tiêu');
        sheet.columns = [
            { header: 'Ngày', key: 'date', width: 15 },
            { header: 'Loại', key: 'type', width: 10 },
            { header: 'Danh mục', key: 'category', width: 20 },
            { header: 'Mô tả', key: 'description', width: 30 },
            { header: 'Số tiền', key: 'amount', width: 15 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        transactions.forEach((t) => {
            sheet.addRow({
                date: new Date(t.date).toLocaleDateString('vi-VN'),
                type: t.type === 'income' ? 'Thu' : 'Chi',
                category: t.category?.name || '',
                description: t.note || '',
                amount: t.amount,
            });
        });
        sheet.addRow([]);
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + Number(t.amount), 0);
        sheet.addRow({ date: 'Tổng thu', amount: totalIncome }).font = {
            bold: true,
            color: { argb: 'FF00B050' },
        };
        sheet.addRow({ date: 'Tổng chi', amount: totalExpense }).font = {
            bold: true,
            color: { argb: 'FFFF0000' },
        };
        sheet.addRow({ date: 'Số dư', amount: totalIncome - totalExpense }).font = {
            bold: true,
        };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportPdf(userId, from, to) {
        const transactions = await this.getTransactions(userId, from, to);
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + Number(t.amount), 0);
        const fonts = {
            Roboto: {
                normal: 'node_modules/pdfmake/build/vfs_fonts.js',
                bold: 'node_modules/pdfmake/build/vfs_fonts.js',
            },
        };
        const printer = new PdfPrinter(fonts);
        const docDefinition = {
            content: [
                { text: 'BÁO CÁO CHI TIÊU', style: 'header' },
                { text: `Từ ${from} đến ${to}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', '*', '*', 'auto'],
                        body: [
                            ['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền'],
                            ...transactions.map((t) => [
                                new Date(t.date).toLocaleDateString('vi-VN'),
                                t.type === 'income' ? 'Thu' : 'Chi',
                                t.category?.name || '',
                                t.note || '',
                                t.amount.toLocaleString('vi-VN'),
                            ]),
                        ],
                    },
                },
                {
                    text: `Tổng thu: ${totalIncome.toLocaleString('vi-VN')} đ`,
                    style: 'income',
                },
                {
                    text: `Tổng chi: ${totalExpense.toLocaleString('vi-VN')} đ`,
                    style: 'expense',
                },
                {
                    text: `Số dư: ${(totalIncome - totalExpense).toLocaleString('vi-VN')} đ`,
                    style: 'balance',
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                },
                subheader: { fontSize: 12, alignment: 'center', margin: [0, 0, 0, 20] },
                income: { color: 'green', bold: true, margin: [0, 10, 0, 0] },
                expense: { color: 'red', bold: true },
                balance: { bold: true, margin: [0, 5, 0, 0] },
            },
        };
        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map