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
exports.CloudController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const s3_service_1 = require("./aws/s3.service");
const lambda_service_1 = require("./aws/lambda.service");
const sqs_service_1 = require("./aws/sqs.service");
const firebase_service_1 = require("./firebase/firebase.service");
const cloudinary_service_1 = require("./cloudinary/cloudinary.service");
const sendgrid_service_1 = require("./sendgrid/sendgrid.service");
const twilio_service_1 = require("./twilio/twilio.service");
const stripe_service_1 = require("./stripe/stripe.service");
let CloudController = class CloudController {
    s3Service;
    lambdaService;
    sqsService;
    firebaseService;
    cloudinaryService;
    sendGridService;
    twilioService;
    stripeService;
    constructor(s3Service, lambdaService, sqsService, firebaseService, cloudinaryService, sendGridService, twilioService, stripeService) {
        this.s3Service = s3Service;
        this.lambdaService = lambdaService;
        this.sqsService = sqsService;
        this.firebaseService = firebaseService;
        this.cloudinaryService = cloudinaryService;
        this.sendGridService = sendGridService;
        this.twilioService = twilioService;
        this.stripeService = stripeService;
    }
    async uploadReceipt(file, userId) {
        const url = await this.s3Service.uploadReceipt(userId, file.buffer, file.originalname);
        return { url };
    }
    async uploadExport(file, userId, format) {
        const url = await this.s3Service.uploadExport(userId, file.buffer, file.originalname, format);
        return { url };
    }
    async getSignedUrl(key) {
        const url = await this.s3Service.getSignedUrl(key);
        return { url };
    }
    async deleteFile(key) {
        await this.s3Service.deleteFile(key);
        return { message: 'File deleted successfully' };
    }
    async analyzeSpending(body) {
        const result = await this.lambdaService.analyzeSpending(body.userId, body.transactions);
        return result;
    }
    async detectFraud(body) {
        const result = await this.lambdaService.detectFraud(body.transaction);
        return result;
    }
    async generateReport(body) {
        const result = await this.lambdaService.generateReport(body.userId, body.params);
        return result;
    }
    async queueEmail(body) {
        const messageId = await this.sqsService.queueEmailJob(body.userId, body.emailType, body.data);
        return { messageId };
    }
    async queueReport(body) {
        const messageId = await this.sqsService.queueReportJob(body.userId, body.reportType, body.params);
        return { messageId };
    }
    async syncTransaction(body) {
        await this.firebaseService.syncTransaction(body.userId, body.transaction);
        return { message: 'Transaction synced to Firebase' };
    }
    async sendPushNotification(body) {
        const messageId = await this.firebaseService.sendPushNotification(body.token, body.title, body.body, body.data);
        return { messageId };
    }
    async sendTopicNotification(body) {
        const messageId = await this.firebaseService.sendTopicNotification(body.topic, body.title, body.body, body.data);
        return { messageId };
    }
    async uploadReceiptToCloudinary(file, userId) {
        const url = await this.cloudinaryService.uploadReceipt(userId, file.buffer);
        return { url };
    }
    async uploadAvatar(file, userId) {
        const url = await this.cloudinaryService.uploadAvatar(userId, file.buffer);
        return { url };
    }
    async sendEmail(body) {
        await this.sendGridService.sendEmail(body.to, body.subject, body.html);
        return { message: 'Email sent successfully' };
    }
    async sendWelcomeEmail(body) {
        await this.sendGridService.sendWelcomeEmail(body.to, body.name);
        return { message: 'Welcome email sent' };
    }
    async sendBudgetAlert(body) {
        await this.sendGridService.sendBudgetAlert(body.to, body.budgetName, body.percentage);
        return { message: 'Budget alert sent' };
    }
    async sendSMS(body) {
        const result = await this.twilioService.sendSMS(body.to, body.message);
        return result;
    }
    async sendVerificationCode(body) {
        const result = await this.twilioService.sendVerificationCode(body.to, body.code);
        return result;
    }
    async sendWhatsApp(body) {
        const result = await this.twilioService.sendWhatsApp(body.to, body.message);
        return result;
    }
    async createPaymentIntent(body) {
        const paymentIntent = await this.stripeService.createPaymentIntent(body.amount, body.currency, body.metadata);
        return paymentIntent;
    }
    async createCustomer(body) {
        const customer = await this.stripeService.createCustomer(body.email, body.name, body.metadata);
        return customer;
    }
    async createSubscription(body) {
        const subscription = await this.stripeService.createSubscription(body.customerId, body.priceId, body.metadata);
        return subscription;
    }
    async upgradeToPremium(body) {
        const result = await this.stripeService.createPremiumSubscription(body.userId, body.email, body.name);
        return result;
    }
    async cancelSubscription(subscriptionId) {
        const subscription = await this.stripeService.cancelSubscription(subscriptionId);
        return subscription;
    }
    async refundCharge(body) {
        const refund = await this.stripeService.refundCharge(body.chargeId, body.amount);
        return refund;
    }
    async healthCheck() {
        return {
            status: 'ok',
            services: {
                aws: 'available',
                firebase: 'available',
                cloudinary: 'available',
                sendgrid: 'available',
                twilio: 'available',
                stripe: 'available',
            },
            timestamp: new Date().toISOString(),
        };
    }
};
exports.CloudController = CloudController;
__decorate([
    (0, common_1.Post)('s3/upload-receipt'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "uploadReceipt", null);
__decorate([
    (0, common_1.Post)('s3/upload-export'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "uploadExport", null);
__decorate([
    (0, common_1.Get)('s3/signed-url/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "getSignedUrl", null);
__decorate([
    (0, common_1.Delete)('s3/file/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)('lambda/analyze-spending'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "analyzeSpending", null);
__decorate([
    (0, common_1.Post)('lambda/detect-fraud'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "detectFraud", null);
__decorate([
    (0, common_1.Post)('lambda/generate-report'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Post)('sqs/queue-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "queueEmail", null);
__decorate([
    (0, common_1.Post)('sqs/queue-report'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "queueReport", null);
__decorate([
    (0, common_1.Post)('firebase/sync-transaction'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "syncTransaction", null);
__decorate([
    (0, common_1.Post)('firebase/push-notification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendPushNotification", null);
__decorate([
    (0, common_1.Post)('firebase/topic-notification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendTopicNotification", null);
__decorate([
    (0, common_1.Post)('cloudinary/upload-receipt'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "uploadReceiptToCloudinary", null);
__decorate([
    (0, common_1.Post)('cloudinary/upload-avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('sendgrid/send-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('sendgrid/welcome-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendWelcomeEmail", null);
__decorate([
    (0, common_1.Post)('sendgrid/budget-alert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendBudgetAlert", null);
__decorate([
    (0, common_1.Post)('twilio/send-sms'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendSMS", null);
__decorate([
    (0, common_1.Post)('twilio/verification-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendVerificationCode", null);
__decorate([
    (0, common_1.Post)('twilio/whatsapp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "sendWhatsApp", null);
__decorate([
    (0, common_1.Post)('stripe/create-payment-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('stripe/create-customer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Post)('stripe/create-subscription'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)('stripe/upgrade-premium'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "upgradeToPremium", null);
__decorate([
    (0, common_1.Delete)('stripe/cancel-subscription/:subscriptionId'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)('stripe/refund'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "refundCharge", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "healthCheck", null);
exports.CloudController = CloudController = __decorate([
    (0, common_1.Controller)('cloud'),
    __metadata("design:paramtypes", [s3_service_1.S3Service,
        lambda_service_1.LambdaService,
        sqs_service_1.SQSService,
        firebase_service_1.FirebaseService,
        cloudinary_service_1.CloudinaryService,
        sendgrid_service_1.SendGridService,
        twilio_service_1.TwilioService,
        stripe_service_1.StripeService])
], CloudController);
//# sourceMappingURL=cloud.controller.js.map