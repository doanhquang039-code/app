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
exports.QueryCache = void 0;
const typeorm_1 = require("typeorm");
let QueryCache = class QueryCache {
    id;
    cache_key;
    cache_value;
    user_id;
    expires_at;
    hit_count;
    created_at;
    updated_at;
};
exports.QueryCache = QueryCache;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QueryCache.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, unique: true }),
    __metadata("design:type", String)
], QueryCache.prototype, "cache_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX' }),
    __metadata("design:type", String)
], QueryCache.prototype, "cache_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], QueryCache.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], QueryCache.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QueryCache.prototype, "hit_count", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QueryCache.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QueryCache.prototype, "updated_at", void 0);
exports.QueryCache = QueryCache = __decorate([
    (0, typeorm_1.Entity)('query_cache'),
    (0, typeorm_1.Index)(['cache_key'], { unique: true }),
    (0, typeorm_1.Index)(['expires_at']),
    (0, typeorm_1.Index)(['user_id'])
], QueryCache);
//# sourceMappingURL=query-cache.entity.js.map