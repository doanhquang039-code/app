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
exports.LambdaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_lambda_1 = require("@aws-sdk/client-lambda");
let LambdaService = class LambdaService {
    configService;
    lambdaClient;
    constructor(configService) {
        this.configService = configService;
        this.lambdaClient = new client_lambda_1.LambdaClient({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
        });
    }
    async invokeFunction(functionName, payload) {
        const command = new client_lambda_1.InvokeCommand({
            FunctionName: functionName,
            Payload: JSON.stringify(payload),
        });
        const response = await this.lambdaClient.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.Payload));
        return result;
    }
    async analyzeSpending(userId, transactions) {
        return await this.invokeFunction('expense-tracker-ai-analysis', {
            userId,
            transactions,
            action: 'analyze',
        });
    }
    async detectFraud(transaction) {
        return await this.invokeFunction('expense-tracker-fraud-detection', {
            transaction,
            action: 'detect',
        });
    }
    async generateReport(userId, params) {
        return await this.invokeFunction('expense-tracker-report-generator', {
            userId,
            params,
            action: 'generate',
        });
    }
    async processReceipt(imageUrl) {
        return await this.invokeFunction('expense-tracker-ocr-processor', {
            imageUrl,
            action: 'process',
        });
    }
    async sendEmail(to, subject, body) {
        return await this.invokeFunction('expense-tracker-email-sender', {
            to,
            subject,
            body,
            action: 'send',
        });
    }
    async backupData(userId) {
        return await this.invokeFunction('expense-tracker-data-backup', {
            userId,
            action: 'backup',
        });
    }
};
exports.LambdaService = LambdaService;
exports.LambdaService = LambdaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LambdaService);
//# sourceMappingURL=lambda.service.js.map