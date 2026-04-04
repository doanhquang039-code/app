"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSavingsGoalDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_savings_goal_dto_1 = require("./create-savings-goal.dto");
class UpdateSavingsGoalDto extends (0, mapped_types_1.PartialType)(create_savings_goal_dto_1.CreateSavingsGoalDto) {
}
exports.UpdateSavingsGoalDto = UpdateSavingsGoalDto;
//# sourceMappingURL=update-savings-goal.dto.js.map