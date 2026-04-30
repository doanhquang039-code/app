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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = __importDefault(require("twilio"));
let TwilioService = class TwilioService {
    configService;
    client;
    fromNumber;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER') || '';
        this.client = (0, twilio_1.default)(accountSid, authToken);
    }
    async sendSMS(to, message) {
        return await this.client.messages.create({
            body: message,
            from: this.fromNumber,
            to,
        });
    }
    async sendBudgetAlertSMS(to, budgetName, percentage) {
        const message = `Budget Alert! Your "${budgetName}" budget has reached ${percentage}%. Check your Expense Tracker app for details.`;
        return await this.sendSMS(to, message);
    }
    async sendTransactionAlertSMS(to, amount, merchant) {
        const message = `Transaction Alert: $${amount} spent at ${merchant}. Reply STOP to unsubscribe.`;
        return await this.sendSMS(to, message);
    }
    async sendVerificationCode(to, code) {
        const message = `Your Expense Tracker verification code is: ${code}. Valid for 10 minutes.`;
        return await this.sendSMS(to, message);
    }
    async sendBulkSMS(recipients, message) {
        const promises = recipients.map(to => this.sendSMS(to, message));
        return await Promise.all(promises);
    }
    async makeCall(to, message) {
        return await this.client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            from: this.fromNumber,
            to,
        });
    }
    async sendWhatsApp(to, message) {
        return await this.client.messages.create({
            body: message,
            from: `whatsapp:${this.fromNumber}`,
            to: `whatsapp:${to}`,
        });
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map