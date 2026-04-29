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
exports.UserFriend = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserFriend = class UserFriend {
    id;
    userId;
    user;
    friendId;
    friend;
    status;
    canViewTransactions;
    canViewBudgets;
    canViewGoals;
    createdAt;
    acceptedAt;
};
exports.UserFriend = UserFriend;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserFriend.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserFriend.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserFriend.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserFriend.prototype, "friendId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'friendId' }),
    __metadata("design:type", user_entity_1.User)
], UserFriend.prototype, "friend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, default: 'PENDING' }),
    __metadata("design:type", String)
], UserFriend.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], UserFriend.prototype, "canViewTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], UserFriend.prototype, "canViewBudgets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], UserFriend.prototype, "canViewGoals", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], UserFriend.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2', nullable: true }),
    __metadata("design:type", Date)
], UserFriend.prototype, "acceptedAt", void 0);
exports.UserFriend = UserFriend = __decorate([
    (0, typeorm_1.Entity)('UserFriends')
], UserFriend);
//# sourceMappingURL=user-friend.entity.js.map