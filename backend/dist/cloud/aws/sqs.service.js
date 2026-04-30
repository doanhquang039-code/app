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
exports.SQSService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_sqs_1 = require("@aws-sdk/client-sqs");
let SQSService = class SQSService {
    configService;
    sqsClient;
    queueUrl;
    constructor(configService) {
        this.configService = configService;
        this.sqsClient = new client_sqs_1.SQSClient({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
        });
        this.queueUrl = this.configService.get('AWS_SQS_QUEUE_URL') || '';
    }
    async sendMessage(message, delaySeconds = 0) {
        const command = new client_sqs_1.SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(message),
            DelaySeconds: delaySeconds,
        });
        const response = await this.sqsClient.send(command);
        return response.MessageId || '';
    }
    async receiveMessages(maxMessages = 10) {
        const command = new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: maxMessages,
            WaitTimeSeconds: 20,
        });
        const response = await this.sqsClient.send(command);
        return response.Messages || [];
    }
    async deleteMessage(receiptHandle) {
        const command = new client_sqs_1.DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
        });
        await this.sqsClient.send(command);
    }
    async queueEmailJob(userId, emailType, data) {
        return await this.sendMessage({
            type: 'email',
            userId,
            emailType,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    async queueReportJob(userId, reportType, params) {
        return await this.sendMessage({
            type: 'report',
            userId,
            reportType,
            params,
            timestamp: new Date().toISOString(),
        });
    }
    async queueAnalyticsJob(userId, period) {
        return await this.sendMessage({
            type: 'analytics',
            userId,
            period,
            timestamp: new Date().toISOString(),
        });
    }
    async queueBackupJob(userId) {
        return await this.sendMessage({
            type: 'backup',
            userId,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.SQSService = SQSService;
exports.SQSService = SQSService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SQSService);
//# sourceMappingURL=sqs.service.js.map