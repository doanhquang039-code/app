import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  create(@Request() req, @Body() createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardsService.create(req.user.id, createCreditCardDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.creditCardsService.findAll(req.user.id);
  }

  @Get('analytics/total-limit')
  async getTotalCreditLimit(@Request() req) {
    const totalLimit = await this.creditCardsService.getTotalCreditLimit(req.user.id);
    return { totalLimit };
  }

  @Get('analytics/total-usage')
  async getTotalCreditUsage(@Request() req) {
    const totalUsage = await this.creditCardsService.getTotalCreditUsage(req.user.id);
    return { totalUsage };
  }

  @Get('analytics/utilization-ratio')
  async getCreditUtilizationRatio(@Request() req) {
    const ratio = await this.creditCardsService.getCreditUtilizationRatio(req.user.id);
    return { utilizationRatio: ratio.toFixed(2) };
  }

  @Get('analytics/upcoming-billing')
  async getUpcomingBillingCycles(@Request() req) {
    const upcomingCycles = await this.creditCardsService.getUpcomingBillingCycles(req.user.id);
    return { upcomingCycles };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.creditCardsService.findOne(+id, req.user.id);
  }

  @Get(':id/available-credit')
  async getAvailableCredit(@Param('id') id: string, @Request() req) {
    const available = await this.creditCardsService.getAvailableCredit(+id, req.user.id);
    return { availableCredit: available };
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCreditCardDto: UpdateCreditCardDto,
  ) {
    return this.creditCardsService.update(+id, req.user.id, updateCreditCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.creditCardsService.remove(+id, req.user.id);
  }

  @Put(':id/balance')
  updateBalance(
    @Param('id') id: string,
    @Request() req,
    @Body() { balance }: { balance: number },
  ) {
    return this.creditCardsService.updateBalance(+id, req.user.id, balance);
  }

  @Get('type/:cardType')
  getCardsByType(@Param('cardType') cardType: string, @Request() req) {
    return this.creditCardsService.getCardsByType(req.user.id, cardType);
  }
}
