import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly service: UserProfilesService) {}

  @Get()
  async getProfile(@Req() req) {
    return this.service.getProfile(req.user.id);
  }

  @Put()
  async updateProfile(@Req() req, @Body() data: any) {
    return this.service.updateProfile(req.user.id, data);
  }

  @Put('settings')
  async updateSettings(@Req() req, @Body() settings: any) {
    return this.service.updateSettings(req.user.id, settings);
  }
}
