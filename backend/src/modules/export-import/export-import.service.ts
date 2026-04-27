import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ExportHistory } from '../../entities/export-history.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { SavingsGoal } from '../../entities/savings-goal.entity';
import { BillReminder } from '../../entities/bill-reminder.entity';
import { ExportDataDto, DataType, ExportType } from './dto/export-data.dto';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportImportService {
  constructor(
    @InjectRepository(ExportHistory)
    private exportHistoryRepo: Repository<ExportHistory>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(SavingsGoal)
    private savingsGoalRepo: Repository<SavingsGoal>,
    @InjectRepository(BillReminder)
    private billReminderRepo: Repository<BillReminder>,
  ) {}

  // Export data to various formats
  async exportData(userId: number, dto: ExportDataDto): Promise<ExportHistory> {
    const exportDir = path.join(process.cwd(), 'exports', userId.toString());
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().getTime();
    const fileName = `${dto.dataType}_${timestamp}.${dto.exportType.toLowerCase()}`;
    const filePath = path.join(exportDir, fileName);

    // Create export history record
    const exportHistory = this.exportHistoryRepo.create({
      userId,
      exportType: dto.exportType,
      fileName,
      filePath,
      dataType: dto.dataType,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      status: 'PROCESSING',
      recordCount: 0,
      fileSize: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.exportHistoryRepo.save(exportHistory);

    try {
      let data: any[];
      let recordCount = 0;

      // Fetch data based on type
      switch (dto.dataType) {
        case DataType.TRANSACTIONS:
          data = await this.getTransactionsData(userId, dto);
          break;
        case DataType.BUDGETS:
          data = await this.getBudgetsData(userId);
          break;
        case DataType.SAVINGS_GOALS:
          data = await this.getSavingsGoalsData(userId);
          break;
        case DataType.BILLS:
          data = await this.getBillsData(userId);
          break;
        case DataType.ALL:
          data = await this.getAllData(userId, dto);
          break;
        default:
          throw new Error('Unsupported data type');
      }

      recordCount = Array.isArray(data) ? data.length : Object.keys(data).reduce((sum, key) => sum + data[key].length, 0);

      // Generate file based on export type
      switch (dto.exportType) {
        case ExportType.EXCEL:
          await this.generateExcel(filePath, data, dto.dataType);
          break;
        case ExportType.CSV:
          await this.generateCSV(filePath, data);
          break;
        case ExportType.PDF:
          await this.generatePDF(filePath, data, dto.dataType);
          break;
        case ExportType.JSON:
          await this.generateJSON(filePath, data);
          break;
      }

      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Update export history
      exportHistory.status = 'COMPLETED';
      exportHistory.recordCount = recordCount;
      exportHistory.fileSize = fileSize;
      await this.exportHistoryRepo.save(exportHistory);

      return exportHistory;
    } catch (error) {
      exportHistory.status = 'FAILED';
      exportHistory.errorMessage = error.message;
      await this.exportHistoryRepo.save(exportHistory);
      throw error;
    }
  }

  // Get transactions data
  private async getTransactionsData(userId: number, dto: ExportDataDto): Promise<any[]> {
    const where: any = { userId };

    if (dto.startDate && dto.endDate) {
      where.date = Between(new Date(dto.startDate), new Date(dto.endDate));
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

  // Get budgets data
  private async getBudgetsData(userId: number): Promise<any[]> {
    return await this.budgetRepo.find({
      where: { userId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get savings goals data
  private async getSavingsGoalsData(userId: number): Promise<any[]> {
    return await this.savingsGoalRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get bills data
  private async getBillsData(userId: number): Promise<any[]> {
    return await this.billReminderRepo.find({
      where: { userId },
      order: { dueDate: 'ASC' },
    });
  }

  // Get all data
  private async getAllData(userId: number, dto: ExportDataDto): Promise<any> {
    return {
      transactions: await this.getTransactionsData(userId, dto),
      budgets: await this.getBudgetsData(userId),
      savingsGoals: await this.getSavingsGoalsData(userId),
      bills: await this.getBillsData(userId),
    };
  }

  // Generate Excel file
  private async generateExcel(filePath: string, data: any, dataType: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    
    if (dataType === DataType.ALL) {
      // Multiple sheets for ALL data
      this.addTransactionsSheet(workbook, data.transactions);
      this.addBudgetsSheet(workbook, data.budgets);
      this.addSavingsGoalsSheet(workbook, data.savingsGoals);
      this.addBillsSheet(workbook, data.bills);
    } else {
      // Single sheet
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

        // Style header
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

  private addTransactionsSheet(workbook: ExcelJS.Workbook, transactions: any[]): void {
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

  private addBudgetsSheet(workbook: ExcelJS.Workbook, budgets: any[]): void {
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

  private addSavingsGoalsSheet(workbook: ExcelJS.Workbook, goals: any[]): void {
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

  private addBillsSheet(workbook: ExcelJS.Workbook, bills: any[]): void {
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

  // Generate CSV file
  private async generateCSV(filePath: string, data: any[]): Promise<void> {
    if (data.length === 0) {
      fs.writeFileSync(filePath, '');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value && typeof value === 'object' && value.name) {
            return `"${value.name}"`;
          }
          return `"${value || ''}"`;
        }).join(',')
      ),
    ].join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf8');
  }

  // Generate JSON file
  private async generateJSON(filePath: string, data: any): Promise<void> {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Generate PDF file (placeholder - requires pdfmake setup)
  private async generatePDF(filePath: string, data: any, dataType: string): Promise<void> {
    // TODO: Implement PDF generation using pdfmake
    // For now, create a simple text file
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath.replace('.pdf', '.txt'), content, 'utf8');
  }

  // Get export history
  async getExportHistory(userId: number): Promise<ExportHistory[]> {
    return await this.exportHistoryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Download exported file
  async downloadExport(userId: number, exportId: number): Promise<{ filePath: string; fileName: string }> {
    const exportHistory = await this.exportHistoryRepo.findOne({
      where: { id: exportId, userId },
    });

    if (!exportHistory) {
      throw new NotFoundException('Export not found');
    }

    if (exportHistory.status !== 'COMPLETED') {
      throw new Error('Export is not completed yet');
    }

    if (!fs.existsSync(exportHistory.filePath)) {
      throw new NotFoundException('Export file not found');
    }

    return {
      filePath: exportHistory.filePath,
      fileName: exportHistory.fileName,
    };
  }

  // Delete old exports (cron job)
  async cleanupOldExports(): Promise<number> {
    const expiredExports = await this.exportHistoryRepo.find({
      where: {
        expiresAt: Between(new Date('2000-01-01'), new Date()),
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
      } catch (error) {
        console.error(`Failed to delete export ${exp.id}:`, error);
      }
    }

    return deletedCount;
  }

  // Import data from file
  async importData(userId: number, file: Express.Multer.File, dataType: DataType): Promise<any> {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let data: any[];

    try {
      if (fileExtension === '.json') {
        const content = fs.readFileSync(file.path, 'utf8');
        data = JSON.parse(content);
      } else if (fileExtension === '.csv') {
        data = await this.parseCSV(file.path);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        data = await this.parseExcel(file.path);
      } else {
        throw new Error('Unsupported file format');
      }

      // Import data based on type
      let importedCount = 0;
      let skippedCount = 0;

      switch (dataType) {
        case DataType.TRANSACTIONS:
          const result = await this.importTransactions(userId, data);
          importedCount = result.imported;
          skippedCount = result.skipped;
          break;
        // Add other data types as needed
        default:
          throw new Error('Import not supported for this data type');
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: data.length,
      };
    } catch (error) {
      // Clean up uploaded file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  private async parseCSV(filePath: string): Promise<any[]> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
  }

  private async parseExcel(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.worksheets[0];
    const data: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell(cell => {
          headers.push(cell.value as string);
        });
      } else {
        const obj: any = {};
        row.eachCell((cell, colNumber) => {
          obj[headers[colNumber - 1]] = cell.value;
        });
        data.push(obj);
      }
    });

    return data;
  }

  private async importTransactions(userId: number, data: any[]): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const item of data) {
      try {
        // Validate and transform data
        const transaction = this.transactionRepo.create({
          userId,
          type: item.type || item.Loại,
          amount: parseFloat(item.amount || item['Số tiền']),
          description: item.description || item['Mô tả'],
          date: new Date(item.date || item.Ngày),
          // Add other fields as needed
        });

        await this.transactionRepo.save(transaction);
        imported++;
      } catch (error) {
        console.error('Failed to import transaction:', error);
        skipped++;
      }
    }

    return { imported, skipped };
  }
}
