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
exports.ChallengeParticipant = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const spending_challenge_entity_1 = require("./spending-challenge.entity");
let ChallengeParticipant = class ChallengeParticipant {
    id;
    challengeId;
    challenge;
    userId;
    user;
    currentAmount;
    progress;
    status;
    completedAt;
    rank;
    joinedAt;
    updatedAt;
};
exports.ChallengeParticipant = ChallengeParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChallengeParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ChallengeParticipant.prototype, "challengeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => spending_challenge_entity_1.SpendingChallenge),
    (0, typeorm_1.JoinColumn)({ name: 'challengeId' }),
    __metadata("design:type", spending_challenge_entity_1.SpendingChallenge)
], ChallengeParticipant.prototype, "challenge", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ChallengeParticipant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ChallengeParticipant.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ChallengeParticipant.prototype, "currentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChallengeParticipant.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, default: 'IN_PROGRESS' }),
    __metadata("design:type", String)
], ChallengeParticipant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2', nullable: true }),
    __metadata("design:type", Date)
], ChallengeParticipant.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChallengeParticipant.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], ChallengeParticipant.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], ChallengeParticipant.prototype, "updatedAt", void 0);
exports.ChallengeParticipant = ChallengeParticipant = __decorate([
    (0, typeorm_1.Entity)('ChallengeParticipants')
], ChallengeParticipant);
//# sourceMappingURL=challenge-participant.entity.js.map