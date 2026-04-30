import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private app: admin.app.App;
  private db: admin.firestore.Firestore;
  private auth: admin.auth.Auth;
  private messaging: admin.messaging.Messaging;

  constructor(private configService: ConfigService) {
    const serviceAccount = {
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    };

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: this.configService.get('FIREBASE_DATABASE_URL'),
    });

    this.db = admin.firestore();
    this.auth = admin.auth();
    this.messaging = admin.messaging();
  }

  // Firestore operations
  async saveToFirestore(collection: string, docId: string, data: any): Promise<void> {
    await this.db.collection(collection).doc(docId).set(data);
  }

  async getFromFirestore(collection: string, docId: string): Promise<any> {
    const doc = await this.db.collection(collection).doc(docId).get();
    return doc.exists ? doc.data() : null;
  }

  async updateFirestore(collection: string, docId: string, data: any): Promise<void> {
    await this.db.collection(collection).doc(docId).update(data);
  }

  async deleteFromFirestore(collection: string, docId: string): Promise<void> {
    await this.db.collection(collection).doc(docId).delete();
  }

  async queryFirestore(collection: string, field: string, operator: any, value: any): Promise<any[]> {
    const snapshot = await this.db.collection(collection).where(field, operator, value).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Real-time sync
  async syncTransaction(userId: number, transaction: any): Promise<void> {
    await this.saveToFirestore('transactions', `${userId}_${transaction.id}`, {
      ...transaction,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async syncBudget(userId: number, budget: any): Promise<void> {
    await this.saveToFirestore('budgets', `${userId}_${budget.id}`, {
      ...budget,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Authentication
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return await this.auth.verifyIdToken(idToken);
  }

  async createCustomToken(uid: string): Promise<string> {
    return await this.auth.createCustomToken(uid);
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    return await this.auth.getUserByEmail(email);
  }

  async createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord> {
    return await this.auth.createUser({
      email,
      password,
      displayName,
    });
  }

  async deleteUser(uid: string): Promise<void> {
    await this.auth.deleteUser(uid);
  }

  // Push Notifications
  async sendPushNotification(token: string, title: string, body: string, data?: any): Promise<string> {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    return await this.messaging.send(message);
  }

  async sendMulticastNotification(tokens: string[], title: string, body: string, data?: any): Promise<any> {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    return await this.messaging.sendEachForMulticast(message);
  }

  async sendTopicNotification(topic: string, title: string, body: string, data?: any): Promise<string> {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      topic,
    };

    return await this.messaging.send(message);
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<admin.messaging.MessagingTopicManagementResponse> {
    return await this.messaging.subscribeToTopic(tokens, topic);
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<admin.messaging.MessagingTopicManagementResponse> {
    return await this.messaging.unsubscribeFromTopic(tokens, topic);
  }
}
