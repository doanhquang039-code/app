"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRecurringTransactionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_recurring_transaction_dto_1 = require("./create-recurring-transaction.dto");
class UpdateRecurringTransactionDto extends (0, mapped_types_1.PartialType)(create_recurring_transaction_dto_1.CreateRecurringTransactionDto) {
}
exports.UpdateRecurringTransactionDto = UpdateRecurringTransactionDto;
//# sourceMappingURL=update-recurring-transaction.dto.js.map