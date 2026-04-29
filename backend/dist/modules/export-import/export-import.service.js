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
exports.ExportImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const export_history_entity_1 = require("../../entities/export-history.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const budget_entity_1 = require("../../entities/budget.entity");
const savings_goal_entity_1 = require("../../entities/savings-goal.entity");
const bill_reminder_entity_1 = require("../../entities/bill-reminder.entity");
const export_data_dto_1 = require("./dto/export-data.dto");
const ExcelJS = __importStar(require("exceljs"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ExportImportService = class ExportImportService {
    exportHistoryRepo;
    transactionRepo;
    budgetRepo;
    savingsGoalRepo;
    billReminderRepo;
    constructor(exportHistoryRepo, transactionRepo, budgetRepo, savingsGoalRepo, billReminderRepo) {
        this.exportHistoryRepo = exportHistoryRepo;
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
        this.savingsGoalRepo = savingsGoalRepo;
        this.billReminderRepo = billReminderRepo;
    }
    async exportData(userId, dto) {
        const exportDir = path.join(process.cwd(), 'exports', userId.toString());
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        const timestamp = new Date().getTime();
        const fileName = `${dto.dataType}_${timestamp}.${dto.exportType.toLowerCase()}`;
        const filePath = path.join(exportDir, fileName);
        const exportHistory = this.exportHistoryRepo.create({
            userId,
            exportType: dto.exportType,
            fileName,
            filePath,
            dataType: dto.dataType,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            status: 'PROCESSING',
            recordCount: 0,
            fileSize: 0,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        const savedExportHistory = await this.exportHistoryRepo.save(exportHistory);
        try {
            let data;
            let recordCount = 0;
            switch (dto.dataType) {
                case export_data_dto_1.DataType.TRANSACTIONS:
                    data = await this.getTransactionsData(userId, dto);
                    break;
                case export_data_dto_1.DataType.BUDGETS:
                    data = await this.getBudgetsData(userId);
                    break;
                case export_data_dto_1.DataType.SAVINGS_GOALS:
                    data = await this.getSavingsGoalsData(userId);
                    break;
                case export_data_dto_1.DataType.BILLS:
                    data = await this.getBillsData(userId);
                    break;
                case export_data_dto_1.DataType.ALL:
                    data = await this.getAllData(userId, dto);
                    break;
                default:
                    throw new Error('Unsupported data type');
            }
            recordCount = Array.isArray(data) ? data.length : Object.keys(data).reduce((sum, key) => sum + data[key].length, 0);
            switch (dto.exportType) {
                case export_data_dto_1.ExportType.EXCEL:
                    await this.generateExcel(filePath, data, dto.dataType);
                    break;
                case export_data_dto_1.ExportType.CSV:
                    if (Array.isArray(data)) {
                        await this.generateCSV(filePath, data);
                    }
                    else {
                        await this.generateCSV(filePath, []);
                    }
                    break;
                case export_data_dto_1.ExportType.PDF:
                    await this.generatePDF(filePath, data, dto.dataType);
                    break;
                case export_data_dto_1.ExportType.JSON:
                    await this.generateJSON(filePath, data);
                    break;
            }
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            savedExportHistory.status = 'COMPLETED';
            savedExportHistory.recordCount = recordCount;
            savedExportHistory.fileSize = fileSize;
            await this.exportHistoryRepo.save(savedExportHistory);
            return savedExportHistory;
        }
        catch (error) {
            savedExportHistory.status = 'FAILED';
            savedExportHistory.errorMessage = error.message;
            await this.exportHistoryRepo.save(savedExportHistory);
            throw error;
        }
    }
    async getTransactionsData(userId, dto) {
        const where = { userId };
        if (dto.startDate && dto.endDate) {
            where.date = (0, typeorm_2.Between)(new Date(dto.startDate), new Date(dto.endDate));
        }
        if (dto.categoryIds && dto.categoryIds.length > 0) {
            where.categoryId = dto.categoryIds;
        }
        if (dto.walletIds && dto.walletIds.length > 0) {
            where.walletId = dto.walletIds;
        }
        return await this.transactionRepo.find({
            where,
            relations: ['category', 'wallet', 'tags'],
            order: { date: 'DESC' },
        });
    }
    async getBudgetsData(userId) {
        return await this.budgetRepo.find({
            where: { userId },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async getSavingsGoalsData(userId) {
        return await this.savingsGoalRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getBillsData(userId) {
        return await this.billReminderRepo.find({
            where: { userId },
            order: { dueDate: 'ASC' },
        });
    }
    async getAllData(userId, dto) {
        return {
            transactions: await this.getTransactionsData(userId, dto),
            budgets: await this.getBudgetsData(userId),
            savingsGoals: await this.getSavingsGoalsData(userId),
            bills: await this.getBillsData(userId),
        };
    }
    async generateExcel(filePath, data, dataType) {
        const workbook = new ExcelJS.Workbook();
        if (dataType === export_data_dto_1.DataType.ALL && !Array.isArray(data)) {
            this.addTransactionsSheet(workbook, data.transactions);
            this.addBudgetsSheet(workbook, data.budgets);
            this.addSavingsGoalsSheet(workbook, data.savingsGoals);
            this.addBillsSheet(workbook, data.bills);
        }
        else if (Array.isArray(data)) {
            const worksheet = workbook.addWorksheet(dataType);
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                worksheet.addRow(headers);
                data.forEach(row => {
                    const values = headers.map(header => {
                        const value = row[header];
                        if (value && typeof value === 'object' && value.name) {
                            return value.name;
                        }
                        return value;
                    });
                    worksheet.addRow(values);
                });
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4472C4' },
                };
            }
        }
        await workbook.xlsx.writeFile(filePath);
    }
    addTransactionsSheet(workbook, transactions) {
        const worksheet = workbook.addWorksheet('Giao dịch');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Ngày', key: 'date', width: 15 },
            { header: 'Loại', key: 'type', width: 12 },
            { header: 'Số tiền', key: 'amount', width: 15 },
            { header: 'Danh mục', key: 'category', width: 20 },
            { header: 'Ví', key: 'wallet', width: 15 },
            { header: 'Mô tả', key: 'description', width: 30 },
        ];
        transactions.forEach(t => {
            worksheet.addRow({
                id: t.id,
                date: t.date,
                type: t.type,
                amount: t.amount,
                category: t.category?.name || '',
                wallet: t.wallet?.name || '',
                description: t.description,
            });
        });
        worksheet.getRow(1).font = { bold: true };
    }
    addBudgetsSheet(workbook, budgets) {
        const worksheet = workbook.addWorksheet('Ngân sách');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Tên', key: 'name', width: 20 },
            { header: 'Số tiền', key: 'amount', width: 15 },
            { header: 'Đã chi', key: 'spent', width: 15 },
            { header: 'Danh mục', key: 'category', width: 20 },
            { header: 'Bắt đầu', key: 'startDate', width: 15 },
            { header: 'Kết thúc', key: 'endDate', width: 15 },
        ];
        budgets.forEach(b => {
            worksheet.addRow({
                id: b.id,
                name: b.name,
                amount: b.amount,
                spent: b.spent,
                category: b.category?.name || '',
                startDate: b.startDate,
                endDate: b.endDate,
            });
        });
        worksheet.getRow(1).font = { bold: true };
    }
    addSavingsGoalsSheet(workbook, goals) {
        const worksheet = workbook.addWorksheet('Mục tiêu tiết kiệm');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Tên', key: 'name', width: 25 },
            { header: 'Mục tiêu', key: 'targetAmount', width: 15 },
            { header: 'Hiện tại', key: 'currentAmount', width: 15 },
            { header: 'Hạn', key: 'deadline', width: 15 },
            { header: 'Trạng thái', key: 'status', width: 15 },
        ];
        goals.forEach(g => {
            worksheet.addRow({
                id: g.id,
                name: g.name,
                targetAmount: g.targetAmount,
                currentAmount: g.currentAmount,
                deadline: g.deadline,
                status: g.status,
            });
        });
        worksheet.getRow(1).font = { bold: true };
    }
    addBillsSheet(workbook, bills) {
        const worksheet = workbook.addWorksheet('Hóa đơn');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Tên', key: 'billName', width: 25 },
            { header: 'Số tiền', key: 'amount', width: 15 },
            { header: 'Hạn thanh toán', key: 'dueDate', width: 15 },
            { header: 'Đã thanh toán', key: 'isPaid', width: 15 },
            { header: 'Trạng thái', key: 'status', width: 15 },
        ];
        bills.forEach(b => {
            worksheet.addRow({
                id: b.id,
                billName: b.billName,
                amount: b.amount,
                dueDate: b.dueDate,
                isPaid: b.isPaid ? 'Có' : 'Không',
                status: b.status,
            });
        });
        worksheet.getRow(1).font = { bold: true };
    }
    async generateCSV(filePath, data) {
        if (data.length === 0) {
            fs.writeFileSync(filePath, '');
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                if (value && typeof value === 'object' && value.name) {
                    return `"${value.name}"`;
                }
                return `"${value || ''}"`;
            }).join(',')),
        ].join('\n');
        fs.writeFileSync(filePath, csvContent, 'utf8');
    }
    async generateJSON(filePath, data) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
    async generatePDF(filePath, data, dataType) {
        const content = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath.replace('.pdf', '.txt'), content, 'utf8');
    }
    async getExportHistory(userId) {
        return await this.exportHistoryRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async downloadExport(userId, exportId) {
        const exportHistory = await this.exportHistoryRepo.findOne({
            where: { id: exportId, userId },
        });
        if (!exportHistory) {
            throw new common_1.NotFoundException('Export not found');
        }
        if (exportHistory.status !== 'COMPLETED') {
            throw new Error('Export is not completed yet');
        }
        if (!fs.existsSync(exportHistory.filePath)) {
            throw new common_1.NotFoundException('Export file not found');
        }
        return {
            filePath: exportHistory.filePath,
            fileName: exportHistory.fileName,
        };
    }
    async cleanupOldExports() {
        const expiredExports = await this.exportHistoryRepo.find({
            where: {
                expiresAt: (0, typeorm_2.Between)(new Date('2000-01-01'), new Date()),
            },
        });
        let deletedCount = 0;
        for (const exp of expiredExports) {
            try {
                if (fs.existsSync(exp.filePath)) {
                    fs.unlinkSync(exp.filePath);
                }
                await this.exportHistoryRepo.remove(exp);
                deletedCount++;
            }
            catch (error) {
                console.error(`Failed to delete export ${exp.id}:`, error);
            }
        }
        return deletedCount;
    }
    async importData(userId, file, dataType) {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        let data;
        try {
            if (fileExtension === '.json') {
                const content = fs.readFileSync(file.path, 'utf8');
                data = JSON.parse(content);
            }
            else if (fileExtension === '.csv') {
                data = await this.parseCSV(file.path);
            }
            else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                data = await this.parseExcel(file.path);
            }
            else {
                throw new Error('Unsupported file format');
            }
            let importedCount = 0;
            let skippedCount = 0;
            switch (dataType) {
                case export_data_dto_1.DataType.TRANSACTIONS:
                    const result = await this.importTransactions(userId, data);
                    importedCount = result.imported;
                    skippedCount = result.skipped;
                    break;
                default:
                    throw new Error('Import not supported for this data type');
            }
            fs.unlinkSync(file.path);
            return {
                success: true,
                imported: importedCount,
                skipped: skippedCount,
                total: data.length,
            };
        }
        catch (error) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw error;
        }
    }
    async parseCSV(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        });
    }
    async parseExcel(filePath) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const data = [];
        const headers = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                row.eachCell(cell => {
                    headers.push(cell.value);
                });
            }
            else {
                const obj = {};
                row.eachCell((cell, colNumber) => {
                    obj[headers[colNumber - 1]] = cell.value;
                });
                data.push(obj);
            }
        });
        return data;
    }
    async importTransactions(userId, data) {
        let imported = 0;
        let skipped = 0;
        for (const item of data) {
            try {
                const transaction = this.transactionRepo.create({
                    userId,
                    type: item.type || item.Loại,
                    amount: parseFloat(item.amount || item['Số tiền']),
                    date: new Date(item.date || item.Ngày),
                });
                await this.transactionRepo.save(transaction);
                imported++;
            }
            catch (error) {
                console.error('Failed to import transaction:', error);
                skipped++;
            }
        }
        return { imported, skipped };
    }
};
exports.ExportImportService = ExportImportService;
exports.ExportImportService = ExportImportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(export_history_entity_1.ExportHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(3, (0, typeorm_1.InjectRepository)(savings_goal_entity_1.SavingsGoal)),
    __param(4, (0, typeorm_1.InjectRepository)(bill_reminder_entity_1.BillReminder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExportImportService);
//# sourceMappingURL=export-import.service.js.map