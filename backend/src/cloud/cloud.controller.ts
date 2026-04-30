import { Controller, Post, Get, Delete, Body, Param, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './aws/s3.service';
import { LambdaService } from './aws/lambda.service';
import { SQSService } from './aws/sqs.service';
import { FirebaseService } from './firebase/firebase.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { SendGridService } from './sendgrid/sendgrid.service';
import { TwilioService } from './twilio/twilio.service';
import { StripeService } from './stripe/stripe.service';

@Controller('cloud')
export class CloudController {
  constructor(
    private s3Service: S3Service,
    private lambdaService: LambdaService,
    private sqsService: SQSService,
    private firebaseService: FirebaseService,
    private cloudinaryService: CloudinaryService,
    private sendGridService: SendGridService,
    private twilioService: TwilioService,
    private stripeService: StripeService,
  ) {}

  // AWS S3 Endpoints
  @Post('s3/upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    const url = await this.s3Service.uploadReceipt(userId, file.buffer, file.originalname);
    return { url };
  }

  @Post('s3/upload-export')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExport(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
    @Body('format') format: string,
  ) {
    const url = await this.s3Service.uploadExport(userId, file.buffer, file.originalname, format);
    return { url };
  }

  @Get('s3/signed-url/:key')
  async getSignedUrl(@Param('key') key: string) {
    const url = await this.s3Service.getSignedUrl(key);
    return { url };
  }

  @Delete('s3/file/:key')
  async deleteFile(@Param('key') key: string) {
    await this.s3Service.deleteFile(key);
    return { message: 'File deleted successfully' };
  }

  // AWS Lambda Endpoints
  @Post('lambda/analyze-spending')
  async analyzeSpending(@Body() body: { userId: number; transactions: any[] }) {
    const result = await this.lambdaService.analyzeSpending(body.userId, body.transactions);
    return result;
  }

  @Post('lambda/detect-fraud')
  async detectFraud(@Body() body: { transaction: any }) {
    const result = await this.lambdaService.detectFraud(body.transaction);
    return result;
  }

  @Post('lambda/generate-report')
  async generateReport(@Body() body: { userId: number; params: any }) {
    const result = await this.lambdaService.generateReport(body.userId, body.params);
    return result;
  }

  // AWS SQS Endpoints
  @Post('sqs/queue-email')
  async queueEmail(@Body() body: { userId: number; emailType: string; data: any }) {
    const messageId = await this.sqsService.queueEmailJob(body.userId, body.emailType, body.data);
    return { messageId };
  }

  @Post('sqs/queue-report')
  async queueReport(@Body() body: { userId: number; reportType: string; params: any }) {
    const messageId = await this.sqsService.queueReportJob(body.userId, body.reportType, body.params);
    return { messageId };
  }

  // Firebase Endpoints
  @Post('firebase/sync-transaction')
  async syncTransaction(@Body() body: { userId: number; transaction: any }) {
    await this.firebaseService.syncTransaction(body.userId, body.transaction);
    return { message: 'Transaction synced to Firebase' };
  }

  @Post('firebase/push-notification')
  async sendPushNotification(@Body() body: { token: string; title: string; body: string; data?: any }) {
    const messageId = await this.firebaseService.sendPushNotification(body.token, body.title, body.body, body.data);
    return { messageId };
  }

  @Post('firebase/topic-notification')
  async sendTopicNotification(@Body() body: { topic: string; title: string; body: string; data?: any }) {
    const messageId = await this.firebaseService.sendTopicNotification(body.topic, body.title, body.body, body.data);
    return { messageId };
  }

  // Cloudinary Endpoints
  @Post('cloudinary/upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceiptToCloudinary(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    const url = await this.cloudinaryService.uploadReceipt(userId, file.buffer);
    return { url };
  }

  @Post('cloudinary/upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    const url = await this.cloudinaryService.uploadAvatar(userId, file.buffer);
    return { url };
  }

  // SendGrid Endpoints
  @Post('sendgrid/send-email')
  async sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    await this.sendGridService.sendEmail(body.to, body.subject, body.html);
    return { message: 'Email sent successfully' };
  }

  @Post('sendgrid/welcome-email')
  async sendWelcomeEmail(@Body() body: { to: string; name: string }) {
    await this.sendGridService.sendWelcomeEmail(body.to, body.name);
    return { message: 'Welcome email sent' };
  }

  @Post('sendgrid/budget-alert')
  async sendBudgetAlert(@Body() body: { to: string; budgetName: string; percentage: number }) {
    await this.sendGridService.sendBudgetAlert(body.to, body.budgetName, body.percentage);
    return { message: 'Budget alert sent' };
  }

  // Twilio Endpoints
  @Post('twilio/send-sms')
  async sendSMS(@Body() body: { to: string; message: string }) {
    const result = await this.twilioService.sendSMS(body.to, body.message);
    return result;
  }

  @Post('twilio/verification-code')
  async sendVerificationCode(@Body() body: { to: string; code: string }) {
    const result = await this.twilioService.sendVerificationCode(body.to, body.code);
    return result;
  }

  @Post('twilio/whatsapp')
  async sendWhatsApp(@Body() body: { to: string; message: string }) {
    const result = await this.twilioService.sendWhatsApp(body.to, body.message);
    return result;
  }

  // Stripe Endpoints
  @Post('stripe/create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; currency?: string; metadata?: any }) {
    const paymentIntent = await this.stripeService.createPaymentIntent(body.amount, body.currency, body.metadata);
    return paymentIntent;
  }

  @Post('stripe/create-customer')
  async createCustomer(@Body() body: { email: string; name: string; metadata?: any }) {
    const customer = await this.stripeService.createCustomer(body.email, body.name, body.metadata);
    return customer;
  }

  @Post('stripe/create-subscription')
  async createSubscription(@Body() body: { customerId: string; priceId: string; metadata?: any }) {
    const subscription = await this.stripeService.createSubscription(body.customerId, body.priceId, body.metadata);
    return subscription;
  }

  @Post('stripe/upgrade-premium')
  async upgradeToPremium(@Body() body: { userId: number; email: string; name: string }) {
    const result = await this.stripeService.createPremiumSubscription(body.userId, body.email, body.name);
    return result;
  }

  @Delete('stripe/cancel-subscription/:subscriptionId')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    const subscription = await this.stripeService.cancelSubscription(subscriptionId);
    return subscription;
  }

  @Post('stripe/refund')
  async refundCharge(@Body() body: { chargeId: string; amount?: number }) {
    const refund = await this.stripeService.refundCharge(body.chargeId, body.amount);
    return refund;
  }

  // Health Check
  @Get('health')
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
}
