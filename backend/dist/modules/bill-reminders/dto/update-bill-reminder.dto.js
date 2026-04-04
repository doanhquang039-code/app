"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBillReminderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bill_reminder_dto_1 = require("./create-bill-reminder.dto");
class UpdateBillReminderDto extends (0, mapped_types_1.PartialType)(create_bill_reminder_dto_1.CreateBillReminderDto) {
}
exports.UpdateBillReminderDto = UpdateBillReminderDto;
//# sourceMappingURL=update-bill-reminder.dto.js.map