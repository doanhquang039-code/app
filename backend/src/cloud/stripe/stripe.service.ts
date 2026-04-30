import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  // Payment Intents
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  // Customers
  async createCustomer(email: string, name: string, metadata?: any): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    return await this.stripe.customers.update(customerId, data);
  }

  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    return await this.stripe.customers.del(customerId);
  }

  // Subscriptions
  async createSubscription(customerId: string, priceId: string, metadata?: any): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, data: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.update(subscriptionId, data);
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.cancel(subscriptionId);
  }

  // Payment Methods
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }

  // Charges
  async createCharge(amount: number, currency: string, source: string, description?: string): Promise<Stripe.Charge> {
    return await this.stripe.charges.create({
      amount: Math.round(amount * 100),
      currency,
      source,
      description,
    });
  }

  async refundCharge(chargeId: string, amount?: number): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      charge: chargeId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  // Invoices
  async createInvoice(customerId: string, metadata?: any): Promise<Stripe.Invoice> {
    return await this.stripe.invoices.create({
      customer: customerId,
      metadata,
    });
  }

  async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return await this.stripe.invoices.finalizeInvoice(invoiceId);
  }

  async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return await this.stripe.invoices.pay(invoiceId);
  }

  // Products & Prices
  async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    return await this.stripe.products.create({
      name,
      description,
    });
  }

  async createPrice(productId: string, amount: number, currency: string = 'usd', recurring?: any): Promise<Stripe.Price> {
    return await this.stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100),
      currency,
      recurring,
    });
  }

  // Webhooks
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Premium Features for Expense Tracker
  async createPremiumSubscription(userId: number, email: string, name: string): Promise<any> {
    // Create customer
    const customer = await this.createCustomer(email, name, { userId: userId.toString() });

    // Create subscription (assuming you have a premium price ID)
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

  async upgradeToPremium(customerId: string): Promise<Stripe.Subscription> {
    const priceId = this.configService.get('STRIPE_PREMIUM_PRICE_ID') || '';
    return await this.createSubscription(customerId, priceId);
  }

  async downgradeTofree(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.cancelSubscription(subscriptionId);
  }
}
