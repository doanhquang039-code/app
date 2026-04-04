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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateDetectionController = void 0;
const common_1 = require("@nestjs/common");
const duplicate_detection_service_1 = require("./duplicate-detection.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let DuplicateDetectionController = class DuplicateDetectionController {
    duplicateDetectionService;
    constructor(duplicateDetectionService) {
        this.duplicateDetectionService = duplicateDetectionService;
    }
    detectDuplicates(req, timeDiffMinutes, amountTolerance) {
        return this.duplicateDetectionService.detectDuplicates(req.user.userId, {
            timeDiffMinutes: timeDiffMinutes ? parseInt(timeDiffMinutes) : 30,
            amountTolerance: amountTolerance ? parseFloat(amountTolerance) : 0,
        });
    }
    findSimilar(req, transactionId) {
        return this.duplicateDetectionService.findSimilar(req.user.userId, +transactionId);
    }
};
exports.DuplicateDetectionController = DuplicateDetectionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('timeDiffMinutes')),
    __param(2, (0, common_1.Query)('amountTolerance')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DuplicateDetectionController.prototype, "detectDuplicates", null);
__decorate([
    (0, common_1.Get)('transaction/:transactionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DuplicateDetectionController.prototype, "findSimilar", null);
exports.DuplicateDetectionController = DuplicateDetectionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('duplicate-detection'),
    __metadata("design:paramtypes", [duplicate_detection_service_1.DuplicateDetectionService])
], DuplicateDetectionController);
//# sourceMappingURL=duplicate-detection.controller.js.map