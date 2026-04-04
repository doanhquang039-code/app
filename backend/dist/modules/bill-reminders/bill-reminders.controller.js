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
exports.BillRemindersController = void 0;
const common_1 = require("@nestjs/common");
const bill_reminders_service_1 = require("./bill-reminders.service");
const create_bill_reminder_dto_1 = require("./dto/create-bill-reminder.dto");
const update_bill_reminder_dto_1 = require("./dto/update-bill-reminder.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BillRemindersController = class BillRemindersController {
    billRemindersService;
    constructor(billRemindersService) {
        this.billRemindersService = billRemindersService;
    }
    create(req, dto) {
        return this.billRemindersService.create(req.user.userId, dto);
    }
    findAll(req, status) {
        return this.billRemindersService.findAll(req.user.userId, status);
    }
    getUpcoming(req) {
        return this.billRemindersService.getUpcomingBills(req.user.userId);
    }
    findOne(req, id) {
        return this.billRemindersService.findOne(req.user.userId, +id);
    }
    update(req, id, dto) {
        return this.billRemindersService.update(req.user.userId, +id, dto);
    }
    markAsPaid(req, id) {
        return this.billRemindersService.markAsPaid(req.user.userId, +id);
    }
    remove(req, id) {
        return this.billRemindersService.remove(req.user.userId, +id);
    }
};
exports.BillRemindersController = BillRemindersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bill_reminder_dto_1.CreateBillReminderDto]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_bill_reminder_dto_1.UpdateBillReminderDto]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/pay'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillRemindersController.prototype, "remove", null);
exports.BillRemindersController = BillRemindersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bill-reminders'),
    __metadata("design:paramtypes", [bill_reminders_service_1.BillRemindersService])
], BillRemindersController);
//# sourceMappingURL=bill-reminders.controller.js.map