"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillRemindersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bill_reminders_service_1 = require("./bill-reminders.service");
const bill_reminders_controller_1 = require("./bill-reminders.controller");
const bill_reminder_entity_1 = require("../../entities/bill-reminder.entity");
let BillRemindersModule = class BillRemindersModule {
};
exports.BillRemindersModule = BillRemindersModule;
exports.BillRemindersModule = BillRemindersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bill_reminder_entity_1.BillReminder])],
        providers: [bill_reminders_service_1.BillRemindersService],
        controllers: [bill_reminders_controller_1.BillRemindersController],
        exports: [bill_reminders_service_1.BillRemindersService],
    })
], BillRemindersModule);
//# sourceMappingURL=bill-reminders.module.js.map