import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  create(@Request() req, @Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountsService.create(req.user.id, createBankAccountDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.bankAccountsService.findAll(req.user.id);
  }

  @Get('total-balance')
  async getTotalBalance(@Request() req) {
    const totalBalance = await this.bankAccountsService.getTotalBalance(req.user.id);
    return { totalBalance };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.bankAccountsService.findOne(+id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(+id, req.user.id, updateBankAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.bankAccountsService.remove(+id, req.user.id);
  }

  @Put(':id/balance')
  updateBalance(
    @Param('id') id: string,
    @Request() req,
    @Body() { balance }: { balance: number },
  ) {
    return this.bankAccountsService.updateBalance(+id, req.user.id, balance);
  }

  @Get('type/:accountType')
  getAccountsByType(@Param('accountType') accountType: string, @Request() req) {
    return this.bankAccountsService.getAccountsByType(req.user.id, accountType);
  }
}
