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
exports.SessionCache = void 0;
const typeorm_1 = require("typeorm");
let SessionCache = class SessionCache {
    id;
    session_id;
    user_id;
    session_data;
    ip_address;
    user_agent;
    last_activity;
    expires_at;
    created_at;
};
exports.SessionCache = SessionCache;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SessionCache.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, unique: true }),
    __metadata("design:type", String)
], SessionCache.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SessionCache.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], SessionCache.prototype, "session_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SessionCache.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SessionCache.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()' }),
    __metadata("design:type", Date)
], SessionCache.prototype, "last_activity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], SessionCache.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SessionCache.prototype, "created_at", void 0);
exports.SessionCache = SessionCache = __decorate([
    (0, typeorm_1.Entity)('session_cache'),
    (0, typeorm_1.Index)(['session_id'], { unique: true }),
    (0, typeorm_1.Index)(['user_id']),
    (0, typeorm_1.Index)(['expires_at'])
], SessionCache);
//# sourceMappingURL=session-cache.entity.js.map