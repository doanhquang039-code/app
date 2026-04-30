"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sgMail = __importStar(require("@sendgrid/mail"));
let SendGridService = class SendGridService {
    configService;
    constructor(configService) {
        this.configService = configService;
        sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY') || '');
    }
    async sendEmail(to, subject, html, text) {
        const msg = {
            to,
            from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@expensetracker.com',
            subject,
            text: text || '',
            html,
        };
        await sgMail.send(msg);
    }
    async sendWelcomeEmail(to, name) {
        const html = `
      <h1>Welcome to Expense Tracker, ${name}!</h1>
      <p>Thank you for joining us. Start tracking your expenses today!</p>
      <a href="https://expensetracker.com/dashboard">Go to Dashboard</a>
    `;
        await this.sendEmail(to, 'Welcome to Expense Tracker!', html);
    }
    async sendBudgetAlert(to, budgetName, percentage) {
        const html = `
      <h1>Budget Alert!</h1>
      <p>Your budget "${budgetName}" has reached ${percentage}% of its limit.</p>
      <p>Consider reviewing your spending to stay within budget.</p>
      <a href="https://expensetracker.com/budgets">View Budgets</a>
    `;
        await this.sendEmail(to, `Budget Alert: ${budgetName}`, html);
    }
    async sendMonthlyReport(to, reportData) {
        const html = `
      <h1>Your Monthly Financial Report</h1>
      <h2>Summary</h2>
      <ul>
        <li>Total Income: $${reportData.totalIncome}</li>
        <li>Total Expenses: $${reportData.totalExpenses}</li>
        <li>Net Savings: $${reportData.netSavings}</li>
      </ul>
      <a href="https://expensetracker.com/reports">View Full Report</a>
    `;
        await this.sendEmail(to, 'Your Monthly Financial Report', html);
    }
    async sendPasswordReset(to, resetToken) {
        const resetUrl = `https://expensetracker.com/reset-password?token=${resetToken}`;
        const html = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
        await this.sendEmail(to, 'Password Reset Request', html);
    }
    async sendBulkEmails(recipients, subject, html) {
        const messages = recipients.map(to => ({
            to,
            from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@expensetracker.com',
            subject,
            html,
        }));
        await sgMail.send(messages);
    }
    async sendTemplateEmail(to, templateId, dynamicData) {
        const msg = {
            to,
            from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@expensetracker.com',
            templateId,
            dynamicTemplateData: dynamicData,
        };
        await sgMail.send(msg);
    }
};
exports.SendGridService = SendGridService;
exports.SendGridService = SendGridService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SendGridService);
//# sourceMappingURL=sendgrid.service.js.map