"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBudgetAlertDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_budget_alert_dto_1 = require("./create-budget-alert.dto");
class UpdateBudgetAlertDto extends (0, mapped_types_1.PartialType)(create_budget_alert_dto_1.CreateBudgetAlertDto) {
}
exports.UpdateBudgetAlertDto = UpdateBudgetAlertDto;
//# sourceMappingURL=update-budget-alert.dto.js.map