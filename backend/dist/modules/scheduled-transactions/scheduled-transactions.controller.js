"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTransactionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const scheduled_transactions_service_1 = require("./scheduled-transactions.service");
const swagger_1 = require("@nestjs/swagger");
let ScheduledTransactionsController = class ScheduledTransactionsController {
    scheduledService;
    constructor(scheduledService) {
        this.scheduledService = scheduledService;
    }
    async create(req, data) {
        return await this.scheduledService.create(req.user.userId, data);
    }
    async findAll(req) {
        return await this.scheduledService.findAll(req.user.userId);
    }
    async getUpcoming(req) {
        return await this.scheduledService.getUpcoming(req.user.userId);
    }
    async findOne(req, id) {
        return await this.scheduledService.findOne(req.user.userId, id);
    }
    async update(req, id, data) {
        return await this.scheduledService.update(req.user.userId, id, data);
    }
    async pause(req, id) {
        return await this.scheduledService.pause(req.user.userId, id);
    }
    async resume(req, id) {
        return await this.scheduledService.resume(req.user.userId, id);
    }
    async executeNow(req, id) {
        return await this.scheduledService.executeNow(req.user.userId, id);
    }
    async remove(req, id) {
        await this.scheduledService.remove(req.user.userId, id);
        return { success: true, message: 'Đã xóa giao dịch định kỳ' };
    }
};
exports.ScheduledTransactionsController = ScheduledTransactionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy giao dịch sắp thực hiện' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/pause'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạm dừng giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "pause", null);
__decorate([
    (0, common_1.Put)(':id/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Tiếp tục giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/execute-now'),
    (0, swagger_1.ApiOperation)({ summary: 'Thực hiện ngay' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "executeNow", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa giao dịch định kỳ' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsController.prototype, "remove", null);
exports.ScheduledTransactionsController = ScheduledTransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Scheduled Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('scheduled-transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [scheduled_transactions_service_1.ScheduledTransactionsService])
], ScheduledTransactionsController);
//# sourceMappingURL=scheduled-transactions.controller.js.map