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
import { SocialService } from './social.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Social')
@ApiBearerAuth()
@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ========== FRIENDS ==========

  @Post('friends/request/:friendId')
  @ApiOperation({ summary: 'Gửi lời mời kết bạn' })
  async sendFriendRequest(@Request() req, @Param('friendId') friendId: number) {
    return await this.socialService.sendFriendRequest(req.user.userId, friendId);
  }

  @Put('friends/accept/:requestId')
  @ApiOperation({ summary: 'Chấp nhận lời mời kết bạn' })
  async acceptFriendRequest(@Request() req, @Param('requestId') requestId: number) {
    return await this.socialService.acceptFriendRequest(req.user.userId, requestId);
  }

  @Put('friends/reject/:requestId')
  @ApiOperation({ summary: 'Từ chối lời mời kết bạn' })
  async rejectFriendRequest(@Request() req, @Param('requestId') requestId: number) {
    await this.socialService.rejectFriendRequest(req.user.userId, requestId);
    return { success: true, message: 'Đã từ chối lời mời kết bạn' };
  }

  @Delete('friends/:friendshipId')
  @ApiOperation({ summary: 'Xóa bạn bè' })
  async removeFriend(@Request() req, @Param('friendshipId') friendshipId: number) {
    await this.socialService.removeFriend(req.user.userId, friendshipId);
    return { success: true, message: 'Đã xóa bạn bè' };
  }

  @Get('friends')
  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  async getFriends(@Request() req) {
    return await this.socialService.getFriends(req.user.userId);
  }

  @Get('friends/requests')
  @ApiOperation({ summary: 'Lấy danh sách lời mời kết bạn' })
  async getPendingRequests(@Request() req) {
    return await this.socialService.getPendingRequests(req.user.userId);
  }

  @Put('friends/:friendshipId/permissions')
  @ApiOperation({ summary: 'Cập nhật quyền xem của bạn bè' })
  async updateFriendPermissions(
    @Request() req,
    @Param('friendshipId') friendshipId: number,
    @Body() permissions: any,
  ) {
    return await this.socialService.updateFriendPermissions(
      req.user.userId,
      friendshipId,
      permissions,
    );
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Tìm kiếm người dùng' })
  async searchUsers(@Request() req, @Query('q') query: string) {
    return await this.socialService.searchUsers(query, req.user.userId);
  }

  // ========== CHALLENGES ==========

  @Post('challenges')
  @ApiOperation({ summary: 'Tạo thử thách chi tiêu' })
  async createChallenge(@Request() req, @Body() data: any) {
    return await this.socialService.createChallenge(req.user.userId, data);
  }

  @Get('challenges/public')
  @ApiOperation({ summary: 'Lấy danh sách thử thách công khai' })
  async getPublicChallenges() {
    return await this.socialService.getPublicChallenges();
  }

  @Get('challenges/my')
  @ApiOperation({ summary: 'Lấy danh sách thử thách của tôi' })
  async getUserChallenges(@Request() req) {
    return await this.socialService.getUserChallenges(req.user.userId);
  }

  @Post('challenges/:challengeId/join')
  @ApiOperation({ summary: 'Tham gia thử thách' })
  async joinChallenge(@Request() req, @Param('challengeId') challengeId: number) {
    return await this.socialService.joinChallenge(req.user.userId, challengeId);
  }

  @Delete('challenges/:challengeId/leave')
  @ApiOperation({ summary: 'Rời khỏi thử thách' })
  async leaveChallenge(@Request() req, @Param('challengeId') challengeId: number) {
    await this.socialService.leaveChallenge(req.user.userId, challengeId);
    return { success: true, message: 'Đã rời khỏi thử thách' };
  }

  @Get('challenges/:challengeId/leaderboard')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng thử thách' })
  async getChallengeLeaderboard(@Param('challengeId') challengeId: number) {
    return await this.socialService.getChallengeLeaderboard(challengeId);
  }

  @Put('challenges/:challengeId/progress')
  @ApiOperation({ summary: 'Cập nhật tiến độ thử thách' })
  async updateChallengeProgress(
    @Request() req,
    @Param('challengeId') challengeId: number,
    @Body() data: { amount: number },
  ) {
    return await this.socialService.updateChallengeProgress(
      req.user.userId,
      challengeId,
      data.amount,
    );
  }
}
