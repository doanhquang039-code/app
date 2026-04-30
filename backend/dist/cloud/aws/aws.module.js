"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const s3_service_1 = require("./s3.service");
const lambda_service_1 = require("./lambda.service");
const sqs_service_1 = require("./sqs.service");
let AWSModule = class AWSModule {
};
exports.AWSModule = AWSModule;
exports.AWSModule = AWSModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [s3_service_1.S3Service, lambda_service_1.LambdaService, sqs_service_1.SQSService],
        exports: [s3_service_1.S3Service, lambda_service_1.LambdaService, sqs_service_1.SQSService],
    })
], AWSModule);
//# sourceMappingURL=aws.module.js.map