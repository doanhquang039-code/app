import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BankIntegrationService } from './bank-integration.service';
import { PlaidService } from './plaid.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bank Integration')
@ApiBearerAuth()
@Controller('bank-integration')
@UseGuards(JwtAuthGuard)
export class BankIntegrationController {
  constructor(
    private readonly bankService: BankIntegrationService,
    private readonly plaidService: PlaidService,
  ) {}

  // ========== PLAID INTEGRATION ==========

  @Post('plaid/link-token')
  @ApiOperation({ summary: 'Tạo Plaid Link token để kết nối ngân hàng' })
  async createPlaidLinkToken(@Request() req) {
    return await this.plaidService.createLinkToken(req.user.userId);
  }

  @Post('plaid/exchange-token')
  @ApiOperation({ summary: 'Exchange public token for access token' })
  async exchangePlaidToken(@Request() req, @Body() data: { publicToken: string }) {
    return await this.plaidService.exchangePublicToken(
      req.user.userId,
      data.publicToken,
    );
  }

  @Get('plaid/accounts')
  @ApiOperation({ summary: 'Lấy danh sách tài khoản từ Plaid' })
  async getPlaidAccounts(@Request() req) {
    return await this.plaidService.getAccounts(req.user.userId);
  }

  @Post('plaid/sync/:accountId')
  @ApiOperation({ summary: 'Đồng bộ giao dịch từ Plaid' })
  async syncPlaidTransactions(@Request() req, @Param('accountId') accountId: number) {
    return await this.plaidService.syncTransactions(req.user.userId, accountId);
  }

  // ========== BANK ACCOUNTS ==========

  @Post('accounts')
  @ApiOperation({ summary: 'Thêm tài khoản ngân hàng thủ công' })
  async createBankAccount(@Request() req, @Body() data: any) {
    return await this.bankService.createBankAccount(req.user.userId, data);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Lấy danh sách tài khoản ngân hàng' })
  async getBankAccounts(@Request() req) {
    return await this.bankService.getUserBankAccounts(req.user.userId);
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Lấy chi tiết tài khoản ngân hàng' })
  async getBankAccount(@Request() req, @Param('id') id: number) {
    return await this.bankService.getBankAccount(req.user.userId, id);
  }

  @Put('accounts/:id')
  @ApiOperation({ summary: 'Cập nhật tài khoản ngân hàng' })
  async updateBankAccount(
    @Request() req,
    @Param('id') id: number,
    @Body() data: any,
  ) {
    return await this.bankService.updateBankAccount(req.user.userId, id, data);
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: 'Xóa tài khoản ngân hàng' })
  async deleteBankAccount(@Request() req, @Param('id') id: number) {
    await this.bankService.deleteBankAccount(req.user.userId, id);
    return { success: true, message: 'Đã xóa tài khoản ngân hàng' };
  }

  @Put('accounts/:id/sync')
  @ApiOperation({ summary: 'Đồng bộ tài khoản ngân hàng' })
  async syncBankAccount(@Request() req, @Param('id') id: number) {
    return await this.bankService.syncBankAccount(req.user.userId, id);
  }

  @Put('accounts/:id/set-primary')
  @ApiOperation({ summary: 'Đặt tài khoản chính' })
  async setPrimaryAccount(@Request() req, @Param('id') id: number) {
    return await this.bankService.setPrimaryAccount(req.user.userId, id);
  }

  // ========== BANK TRANSACTIONS ==========

  @Get('transactions')
  @ApiOperation({ summary: 'Lấy danh sách giao dịch ngân hàng' })
  async getBankTransactions(
    @Request() req,
    @Query('accountId') accountId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.bankService.getBankTransactions(req.user.userId, {
      accountId,
      startDate,
      endDate,
    });
  }

  @Get('transactions/unreconciled')
  @ApiOperation({ summary: 'Lấy giao dịch chưa đối soát' })
  async getUnreconciledTransactions(@Request() req) {
    return await this.bankService.getUnreconciledTransactions(req.user.userId);
  }

  @Post('transactions/:id/reconcile')
  @ApiOperation({ summary: 'Đối soát giao dịch ngân hàng với giao dịch thủ công' })
  async reconcileTransaction(
    @Request() req,
    @Param('id') id: number,
    @Body() data: { transactionId: number },
  ) {
    return await this.bankService.reconcileTransaction(
      req.user.userId,
      id,
      data.transactionId,
    );
  }

  @Post('transactions/:id/create-transaction')
  @ApiOperation({ summary: 'Tạo giao dịch từ giao dịch ngân hàng' })
  async createTransactionFromBank(@Request() req, @Param('id') id: number) {
    return await this.bankService.createTransactionFromBankTransaction(
      req.user.userId,
      id,
    );
  }

  @Post('transactions/auto-reconcile')
  @ApiOperation({ summary: 'Tự động đối soát giao dịch' })
  async autoReconcile(@Request() req) {
    return await this.bankService.autoReconcileTransactions(req.user.userId);
  }

  // ========== STATISTICS ==========

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê tài khoản ngân hàng' })
  async getBankStats(@Request() req) {
    return await this.bankService.getBankAccountStats(req.user.userId);
  }

  @Get('balance-history')
  @ApiOperation({ summary: 'Lịch sử số dư tài khoản' })
  async getBalanceHistory(
    @Request() req,
    @Query('accountId') accountId: number,
    @Query('days') days?: number,
  ) {
    return await this.bankService.getBalanceHistory(
      req.user.userId,
      accountId,
      days ? Number(days) : 30,
    );
  }
}
