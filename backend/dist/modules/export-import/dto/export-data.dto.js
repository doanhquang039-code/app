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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDataDto = exports.ExportDataDto = exports.DataType = exports.ExportType = void 0;
const class_validator_1 = require("class-validator");
var ExportType;
(function (ExportType) {
    ExportType["EXCEL"] = "EXCEL";
    ExportType["CSV"] = "CSV";
    ExportType["PDF"] = "PDF";
    ExportType["JSON"] = "JSON";
})(ExportType || (exports.ExportType = ExportType = {}));
var DataType;
(function (DataType) {
    DataType["TRANSACTIONS"] = "TRANSACTIONS";
    DataType["BUDGETS"] = "BUDGETS";
    DataType["SAVINGS_GOALS"] = "SAVINGS_GOALS";
    DataType["BILLS"] = "BILLS";
    DataType["BANK_ACCOUNTS"] = "BANK_ACCOUNTS";
    DataType["CREDIT_CARDS"] = "CREDIT_CARDS";
    DataType["REPORTS"] = "REPORTS";
    DataType["ALL"] = "ALL";
})(DataType || (exports.DataType = DataType = {}));
class ExportDataDto {
    exportType;
    dataType;
    startDate;
    endDate;
    categoryIds;
    walletIds;
    includeAttachments;
}
exports.ExportDataDto = ExportDataDto;
__decorate([
    (0, class_validator_1.IsEnum)(ExportType),
    __metadata("design:type", String)
], ExportDataDto.prototype, "exportType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DataType),
    __metadata("design:type", String)
], ExportDataDto.prototype, "dataType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportDataDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportDataDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExportDataDto.prototype, "categoryIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExportDataDto.prototype, "walletIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ExportDataDto.prototype, "includeAttachments", void 0);
class ImportDataDto {
    dataType;
    overwriteExisting;
    skipDuplicates;
}
exports.ImportDataDto = ImportDataDto;
__decorate([
    (0, class_validator_1.IsEnum)(DataType),
    __metadata("design:type", String)
], ImportDataDto.prototype, "dataType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ImportDataDto.prototype, "overwriteExisting", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ImportDataDto.prototype, "skipDuplicates", void 0);
//# sourceMappingURL=export-data.dto.js.map