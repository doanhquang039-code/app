import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.walletsService.findAll(req.user.userId);
  }

  @Get('total-balance')
  getTotalBalance(@Request() req) {
    return this.walletsService.getTotalBalance(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.walletsService.findOne(req.user.userId, +id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletsService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.walletsService.remove(req.user.userId, +id);
  }

  @Post('transfer')
  transfer(@Request() req, @Body() dto: TransferWalletDto) {
    return this.walletsService.transfer(req.user.userId, dto);
  }
}
