"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateDetectionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const duplicate_detection_service_1 = require("./duplicate-detection.service");
const duplicate_detection_controller_1 = require("./duplicate-detection.controller");
const transaction_entity_1 = require("../../entities/transaction.entity");
let DuplicateDetectionModule = class DuplicateDetectionModule {
};
exports.DuplicateDetectionModule = DuplicateDetectionModule;
exports.DuplicateDetectionModule = DuplicateDetectionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction])],
        providers: [duplicate_detection_service_1.DuplicateDetectionService],
        controllers: [duplicate_detection_controller_1.DuplicateDetectionController],
        exports: [duplicate_detection_service_1.DuplicateDetectionService],
    })
], DuplicateDetectionModule);
//# sourceMappingURL=duplicate-detection.module.js.map