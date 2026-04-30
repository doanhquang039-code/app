import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async exportToExcel(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Buffer> {
    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Add header
    worksheet.columns = [
      { header: 'Ngày', key: 'date', width: 15 },
      { header: 'Loại', key: 'type', width: 12 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Số tiền', key: 'amount', width: 15 },
      { header: 'Ghi chú', key: 'note', width: 30 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };

    // Add data
    transactions.forEach((t) => {
      worksheet.addRow({
        date: new Date(t.date).toLocaleDateString('vi-VN'),
        type: t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        category: t.categoryId || 'Khác',
        amount: Number(t.amount).toLocaleString('vi-VN'),
        note: t.note || '',
      });
    });

    // Add summary
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

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToPDF(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Buffer> {
    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'DESC' },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Simple PDF generation - can be enhanced with real PDF library later
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

  async exportToCSV(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<string> {
    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
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
}
