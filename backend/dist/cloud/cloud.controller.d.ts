import { S3Service } from './aws/s3.service';
import { LambdaService } from './aws/lambda.service';
import { SQSService } from './aws/sqs.service';
import { FirebaseService } from './firebase/firebase.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { SendGridService } from './sendgrid/sendgrid.service';
import { TwilioService } from './twilio/twilio.service';
import { StripeService } from './stripe/stripe.service';
export declare class CloudController {
    private s3Service;
    private lambdaService;
    private sqsService;
    private firebaseService;
    private cloudinaryService;
    private sendGridService;
    private twilioService;
    private stripeService;
    constructor(s3Service: S3Service, lambdaService: LambdaService, sqsService: SQSService, firebaseService: FirebaseService, cloudinaryService: CloudinaryService, sendGridService: SendGridService, twilioService: TwilioService, stripeService: StripeService);
    uploadReceipt(file: Express.Multer.File, userId: number): Promise<{
        url: string;
    }>;
    uploadExport(file: Express.Multer.File, userId: number, format: string): Promise<{
        url: string;
    }>;
    getSignedUrl(key: string): Promise<{
        url: string;
    }>;
    deleteFile(key: string): Promise<{
        message: string;
    }>;
    analyzeSpending(body: {
        userId: number;
        transactions: any[];
    }): Promise<any>;
    detectFraud(body: {
        transaction: any;
    }): Promise<any>;
    generateReport(body: {
        userId: number;
        params: any;
    }): Promise<any>;
    queueEmail(body: {
        userId: number;
        emailType: string;
        data: any;
    }): Promise<{
        messageId: string;
    }>;
    queueReport(body: {
        userId: number;
        reportType: string;
        params: any;
    }): Promise<{
        messageId: string;
    }>;
    syncTransaction(body: {
        userId: number;
        transaction: any;
    }): Promise<{
        message: string;
    }>;
    sendPushNotification(body: {
        token: string;
        title: string;
        body: string;
        data?: any;
    }): Promise<{
        messageId: string;
    }>;
    sendTopicNotification(body: {
        topic: string;
        title: string;
        body: string;
        data?: any;
    }): Promise<{
        messageId: string;
    }>;
    uploadReceiptToCloudinary(file: Express.Multer.File, userId: number): Promise<{
        url: string;
    }>;
    uploadAvatar(file: Express.Multer.File, userId: number): Promise<{
        url: string;
    }>;
    sendEmail(body: {
        to: string;
        subject: string;
        html: string;
    }): Promise<{
        message: string;
    }>;
    sendWelcomeEmail(body: {
        to: string;
        name: string;
    }): Promise<{
        message: string;
    }>;
    sendBudgetAlert(body: {
        to: string;
        budgetName: string;
        percentage: number;
    }): Promise<{
        message: string;
    }>;
    sendSMS(body: {
        to: string;
        message: string;
    }): Promise<any>;
    sendVerificationCode(body: {
        to: string;
        code: string;
    }): Promise<any>;
    sendWhatsApp(body: {
        to: string;
        message: string;
    }): Promise<any>;
    createPaymentIntent(body: {
        amount: number;
        currency?: string;
        metadata?: any;
    }): Promise<import("stripe").Stripe.PaymentIntent>;
    createCustomer(body: {
        email: string;
        name: string;
        metadata?: any;
    }): Promise<import("stripe").Stripe.Customer>;
    createSubscription(body: {
        customerId: string;
        priceId: string;
        metadata?: any;
    }): Promise<import("stripe").Stripe.Subscription>;
    upgradeToPremium(body: {
        userId: number;
        email: string;
        name: string;
    }): Promise<any>;
    cancelSubscription(subscriptionId: string): Promise<import("stripe").Stripe.Subscription>;
    refundCharge(body: {
        chargeId: string;
        amount?: number;
    }): Promise<import("stripe").Stripe.Refund>;
    healthCheck(): Promise<{
        status: string;
        services: {
            aws: string;
            firebase: string;
            cloudinary: string;
            sendgrid: string;
            twilio: string;
            stripe: string;
        };
        timestamp: string;
    }>;
}
