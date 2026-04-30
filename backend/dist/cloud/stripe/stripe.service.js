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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = class StripeService {
    configService;
    stripe;
    constructor(configService) {
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2025-02-24.acacia',
        });
    }
    async createPaymentIntent(amount, currency = 'usd', metadata) {
        return await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata,
        });
    }
    async confirmPaymentIntent(paymentIntentId) {
        return await this.stripe.paymentIntents.confirm(paymentIntentId);
    }
    async cancelPaymentIntent(paymentIntentId) {
        return await this.stripe.paymentIntents.cancel(paymentIntentId);
    }
    async createCustomer(email, name, metadata) {
        return await this.stripe.customers.create({
            email,
            name,
            metadata,
        });
    }
    async getCustomer(customerId) {
        return await this.stripe.customers.retrieve(customerId);
    }
    async updateCustomer(customerId, data) {
        return await this.stripe.customers.update(customerId, data);
    }
    async deleteCustomer(customerId) {
        return await this.stripe.customers.del(customerId);
    }
    async createSubscription(customerId, priceId, metadata) {
        return await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            metadata,
        });
    }
    async getSubscription(subscriptionId) {
        return await this.stripe.subscriptions.retrieve(subscriptionId);
    }
    async updateSubscription(subscriptionId, data) {
        return await this.stripe.subscriptions.update(subscriptionId, data);
    }
    async cancelSubscription(subscriptionId) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
    }
    async attachPaymentMethod(paymentMethodId, customerId) {
        return await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
    }
    async detachPaymentMethod(paymentMethodId) {
        return await this.stripe.paymentMethods.detach(paymentMethodId);
    }
    async listPaymentMethods(customerId) {
        const paymentMethods = await this.stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return paymentMethods.data;
    }
    async createCharge(amount, currency, source, description) {
        return await this.stripe.charges.create({
            amount: Math.round(amount * 100),
            currency,
            source,
            description,
        });
    }
    async refundCharge(chargeId, amount) {
        return await this.stripe.refunds.create({
            charge: chargeId,
            amount: amount ? Math.round(amount * 100) : undefined,
        });
    }
    async createInvoice(customerId, metadata) {
        return await this.stripe.invoices.create({
            customer: customerId,
            metadata,
        });
    }
    async finalizeInvoice(invoiceId) {
        return await this.stripe.invoices.finalizeInvoice(invoiceId);
    }
    async payInvoice(invoiceId) {
        return await this.stripe.invoices.pay(invoiceId);
    }
    async createProduct(name, description) {
        return await this.stripe.products.create({
            name,
            description,
        });
    }
    async createPrice(productId, amount, currency = 'usd', recurring) {
        return await this.stripe.prices.create({
            product: productId,
            unit_amount: Math.round(amount * 100),
            currency,
            recurring,
        });
    }
    constructWebhookEvent(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
    async createPremiumSubscription(userId, email, name) {
        const customer = await this.createCustomer(email, name, { userId: userId.toString() });
        const priceId = this.configService.get('STRIPE_PREMIUM_PRICE_ID') || '';
        const subscription = await this.createSubscription(customer.id, priceId, {
            userId: userId.toString(),
            plan: 'premium',
        });
        return {
            customerId: customer.id,
            subscriptionId: subscription.id,
            status: subscription.status,
        };
    }
    async upgradeToPremium(customerId) {
        const priceId = this.configService.get('STRIPE_PREMIUM_PRICE_ID') || '';
        return await this.createSubscription(customerId, priceId);
    }
    async downgradeTofree(subscriptionId) {
        return await this.cancelSubscription(subscriptionId);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map