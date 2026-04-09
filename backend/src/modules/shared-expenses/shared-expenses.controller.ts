import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { SharedExpensesService } from './shared-expenses.service';
import { CreateGroupDto, CreateSharedExpenseDto, UpdateGroupDto } from './dto/shared-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shared-expenses')
export class SharedExpensesController {
  constructor(private readonly sharedExpensesService: SharedExpensesService) {}

  // Group endpoints
  @Post('groups')
  createGroup(@Request() req, @Body() createGroupDto: CreateGroupDto) {
    return this.sharedExpensesService.createGroup(req.user.id, createGroupDto);
  }

  @Get('groups')
  getGroups(@Request() req) {
    return this.sharedExpensesService.getGroupsForUser(req.user.id);
  }

  @Get('groups/:groupId')
  getGroupDetails(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.getGroupDetails(+groupId, req.user.id);
  }

  @Put('groups/:groupId')
  updateGroup(@Param('groupId') groupId: string, @Request() req, @Body() updateGroupDto: UpdateGroupDto) {
    return this.sharedExpensesService.updateGroup(+groupId, req.user.id, updateGroupDto);
  }

  @Delete('groups/:groupId')
  deleteGroup(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.deleteGroup(+groupId, req.user.id);
  }

  @Post('groups/:groupId/members/:memberId')
  addMember(@Param('groupId') groupId: string, @Param('memberId') memberId: string, @Request() req) {
    return this.sharedExpensesService.addMemberToGroup(+groupId, +memberId, req.user.id);
  }

  @Delete('groups/:groupId/members/:memberId')
  removeMember(@Param('groupId') groupId: string, @Param('memberId') memberId: string, @Request() req) {
    return this.sharedExpensesService.removeMemberFromGroup(+groupId, +memberId, req.user.id);
  }

  // Expense endpoints
  @Post('groups/:groupId/expenses')
  createExpense(
    @Param('groupId') groupId: string,
    @Request() req,
    @Body() createExpenseDto: CreateSharedExpenseDto,
  ) {
    return this.sharedExpensesService.createSharedExpense(req.user.id, +groupId, createExpenseDto);
  }

  @Get('groups/:groupId/expenses')
  getGroupExpenses(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.getGroupExpenses(+groupId, req.user.id);
  }

  @Get('groups/:groupId/expenses/:expenseId')
  getExpenseDetails(@Param('groupId') groupId: string, @Param('expenseId') expenseId: string, @Request() req) {
    return this.sharedExpensesService.getExpenseDetails(+expenseId, req.user.id);
  }

  @Delete('groups/:groupId/expenses/:expenseId')
  deleteExpense(@Param('groupId') groupId: string, @Param('expenseId') expenseId: string, @Request() req) {
    return this.sharedExpensesService.deleteExpense(+expenseId, req.user.id);
  }

  // Settlement endpoints
  @Get('groups/:groupId/settlements')
  getSettlements(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.getSettlementsForGroup(+groupId, req.user.id);
  }

  @Get('groups/:groupId/my-settlements')
  getMySettlements(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.getSettlementsForUser(+groupId, req.user.id);
  }

  @Put('settlements/:settlementId/settle')
  settlePayment(@Param('settlementId') settlementId: string, @Request() req) {
    return this.sharedExpensesService.settlePayment(+settlementId, req.user.id);
  }

  @Get('groups/:groupId/balance')
  getBalance(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.getGroupBalance(+groupId, req.user.id);
  }

  @Get('groups/:groupId/summary')
  getExpenseSummary(@Param('groupId') groupId: string, @Request() req) {
    return this.sharedExpensesService.getExpenseSummary(+groupId, req.user.id);
  }
}
