import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService {
    private configService;
    private app;
    private db;
    private auth;
    private messaging;
    constructor(configService: ConfigService);
    saveToFirestore(collection: string, docId: string, data: any): Promise<void>;
    getFromFirestore(collection: string, docId: string): Promise<any>;
    updateFirestore(collection: string, docId: string, data: any): Promise<void>;
    deleteFromFirestore(collection: string, docId: string): Promise<void>;
    queryFirestore(collection: string, field: string, operator: any, value: any): Promise<any[]>;
    syncTransaction(userId: number, transaction: any): Promise<void>;
    syncBudget(userId: number, budget: any): Promise<void>;
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    createCustomToken(uid: string): Promise<string>;
    getUserByEmail(email: string): Promise<admin.auth.UserRecord>;
    createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord>;
    deleteUser(uid: string): Promise<void>;
    sendPushNotification(token: string, title: string, body: string, data?: any): Promise<string>;
    sendMulticastNotification(tokens: string[], title: string, body: string, data?: any): Promise<any>;
    sendTopicNotification(topic: string, title: string, body: string, data?: any): Promise<string>;
    subscribeToTopic(tokens: string[], topic: string): Promise<admin.messaging.MessagingTopicManagementResponse>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<admin.messaging.MessagingTopicManagementResponse>;
}
