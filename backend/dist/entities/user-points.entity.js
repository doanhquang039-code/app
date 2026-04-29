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
exports.UserPoints = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserPoints = class UserPoints {
    id;
    userId;
    user;
    totalPoints;
    level;
    currentLevelPoints;
    nextLevelPoints;
    dailyStreak;
    longestStreak;
    lastActivityDate;
    rank;
    createdAt;
    updatedAt;
};
exports.UserPoints = UserPoints;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserPoints.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", Number)
], UserPoints.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserPoints.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UserPoints.prototype, "totalPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], UserPoints.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UserPoints.prototype, "currentLevelPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 100 }),
    __metadata("design:type", Number)
], UserPoints.prototype, "nextLevelPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UserPoints.prototype, "dailyStreak", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UserPoints.prototype, "longestStreak", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2', nullable: true }),
    __metadata("design:type", Date)
], UserPoints.prototype, "lastActivityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100, default: 'Người mới' }),
    __metadata("design:type", String)
], UserPoints.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], UserPoints.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], UserPoints.prototype, "updatedAt", void 0);
exports.UserPoints = UserPoints = __decorate([
    (0, typeorm_1.Entity)('UserPoints')
], UserPoints);
//# sourceMappingURL=user-points.entity.js.map