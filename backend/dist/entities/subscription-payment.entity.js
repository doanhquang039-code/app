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
exports.SubscriptionPayment = void 0;
const typeorm_1 = require("typeorm");
const subscription_entity_1 = require("./subscription.entity");
const transaction_entity_1 = require("./transaction.entity");
let SubscriptionPayment = class SubscriptionPayment {
    id;
    subscriptionId;
    subscription;
    transactionId;
    transaction;
    amount;
    paymentDate;
    dueDate;
    status;
    paymentMethod;
    notes;
    isAutomatic;
    createdAt;
};
exports.SubscriptionPayment = SubscriptionPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.Subscription),
    (0, typeorm_1.JoinColumn)({ name: 'subscriptionId' }),
    __metadata("design:type", subscription_entity_1.Subscription)
], SubscriptionPayment.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction),
    (0, typeorm_1.JoinColumn)({ name: 'transactionId' }),
    __metadata("design:type", transaction_entity_1.Transaction)
], SubscriptionPayment.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, default: 'PENDING' }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], SubscriptionPayment.prototype, "isAutomatic", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "createdAt", void 0);
exports.SubscriptionPayment = SubscriptionPayment = __decorate([
    (0, typeorm_1.Entity)('SubscriptionPayments')
], SubscriptionPayment);
//# sourceMappingURL=subscription-payment.entity.js.map