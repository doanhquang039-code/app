import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import * as ExcelJS from 'exceljs';
const PdfPrinter = require('pdfmake');

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async getTransactions(userId: number, from: string, to: string) {
    return this.transactionRepo.find({
      where: {
        userId,
        date: Between(new Date(from), new Date(to)),
      },
      relations: ['category'],
      order: { date: 'DESC' },
    });
  }

  async exportExcel(userId: number, from: string, to: string): Promise<Buffer> {
    const transactions = await this.getTransactions(userId, from, to);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Báo cáo chi tiêu');

    // Header
    sheet.columns = [
      { header: 'Ngày', key: 'date', width: 15 },
      { header: 'Loại', key: 'type', width: 10 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Mô tả', key: 'description', width: 30 },
      { header: 'Số tiền', key: 'amount', width: 15 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Data
    transactions.forEach((t) => {
      sheet.addRow({
        date: new Date(t.date).toLocaleDateString('vi-VN'),
        type: t.type === 'income' ? 'Thu' : 'Chi',
        category: t.category?.name || '',
        description: t.note || '',
        amount: t.amount,
      });
    });

    // Tổng kết
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

  async exportPdf(userId: number, from: string, to: string): Promise<Buffer> {
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

    const docDefinition: any = {
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
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
