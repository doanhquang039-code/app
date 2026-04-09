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
exports.GroupSettlement = exports.SharedExpense = exports.SharedExpenseGroup = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let SharedExpenseGroup = class SharedExpenseGroup {
    id;
    groupName;
    ownerId;
    description;
    totalAmount;
    icon;
    isActive;
    createdAt;
    updatedAt;
    owner;
    members;
};
exports.SharedExpenseGroup = SharedExpenseGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SharedExpenseGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SharedExpenseGroup.prototype, "groupName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SharedExpenseGroup.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SharedExpenseGroup.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SharedExpenseGroup.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SharedExpenseGroup.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SharedExpenseGroup.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SharedExpenseGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SharedExpenseGroup.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", user_entity_1.User)
], SharedExpenseGroup.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({
        name: 'group_members',
        joinColumn: { name: 'groupId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], SharedExpenseGroup.prototype, "members", void 0);
exports.SharedExpenseGroup = SharedExpenseGroup = __decorate([
    (0, typeorm_1.Entity)('SharedExpenseGroups')
], SharedExpenseGroup);
let SharedExpense = class SharedExpense {
    id;
    groupId;
    paidByUserId;
    description;
    amount;
    splits;
    date;
    createdAt;
    updatedAt;
    group;
    paidByUser;
};
exports.SharedExpense = SharedExpense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SharedExpense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SharedExpense.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SharedExpense.prototype, "paidByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SharedExpense.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], SharedExpense.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SharedExpense.prototype, "splits", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SharedExpense.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SharedExpense.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SharedExpense.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SharedExpenseGroup),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", SharedExpenseGroup)
], SharedExpense.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'paidByUserId' }),
    __metadata("design:type", user_entity_1.User)
], SharedExpense.prototype, "paidByUser", void 0);
exports.SharedExpense = SharedExpense = __decorate([
    (0, typeorm_1.Entity)('SharedExpenses')
], SharedExpense);
let GroupSettlement = class GroupSettlement {
    id;
    groupId;
    fromUserId;
    toUserId;
    amount;
    isSettled;
    settledDate;
    createdAt;
    updatedAt;
    group;
};
exports.GroupSettlement = GroupSettlement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GroupSettlement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GroupSettlement.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GroupSettlement.prototype, "fromUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GroupSettlement.prototype, "toUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], GroupSettlement.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], GroupSettlement.prototype, "isSettled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], GroupSettlement.prototype, "settledDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GroupSettlement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GroupSettlement.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SharedExpenseGroup),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", SharedExpenseGroup)
], GroupSettlement.prototype, "group", void 0);
exports.GroupSettlement = GroupSettlement = __decorate([
    (0, typeorm_1.Entity)('GroupSettlements')
], GroupSettlement);
//# sourceMappingURL=shared-expense.entity.js.map