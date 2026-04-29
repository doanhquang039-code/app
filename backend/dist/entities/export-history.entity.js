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
exports.ExportHistory = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let ExportHistory = class ExportHistory {
    id;
    userId;
    user;
    exportType;
    fileName;
    filePath;
    dataType;
    startDate;
    endDate;
    recordCount;
    fileSize;
    status;
    errorMessage;
    createdAt;
    expiresAt;
};
exports.ExportHistory = ExportHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExportHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ExportHistory.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ExportHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], ExportHistory.prototype, "exportType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255 }),
    __metadata("design:type", String)
], ExportHistory.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500 }),
    __metadata("design:type", String)
], ExportHistory.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], ExportHistory.prototype, "dataType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2', nullable: true }),
    __metadata("design:type", Date)
], ExportHistory.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2', nullable: true }),
    __metadata("design:type", Date)
], ExportHistory.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ExportHistory.prototype, "recordCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ExportHistory.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, default: 'COMPLETED' }),
    __metadata("design:type", String)
], ExportHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], ExportHistory.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], ExportHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2', nullable: true }),
    __metadata("design:type", Date)
], ExportHistory.prototype, "expiresAt", void 0);
exports.ExportHistory = ExportHistory = __decorate([
    (0, typeorm_1.Entity)('ExportHistory')
], ExportHistory);
//# sourceMappingURL=export-history.entity.js.map