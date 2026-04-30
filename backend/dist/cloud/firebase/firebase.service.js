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
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
let FirebaseService = class FirebaseService {
    configService;
    app;
    db;
    auth;
    messaging;
    constructor(configService) {
        this.configService = configService;
        const serviceAccount = {
            projectId: this.configService.get('FIREBASE_PROJECT_ID'),
            clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        };
        this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: this.configService.get('FIREBASE_DATABASE_URL'),
        });
        this.db = admin.firestore();
        this.auth = admin.auth();
        this.messaging = admin.messaging();
    }
    async saveToFirestore(collection, docId, data) {
        await this.db.collection(collection).doc(docId).set(data);
    }
    async getFromFirestore(collection, docId) {
        const doc = await this.db.collection(collection).doc(docId).get();
        return doc.exists ? doc.data() : null;
    }
    async updateFirestore(collection, docId, data) {
        await this.db.collection(collection).doc(docId).update(data);
    }
    async deleteFromFirestore(collection, docId) {
        await this.db.collection(collection).doc(docId).delete();
    }
    async queryFirestore(collection, field, operator, value) {
        const snapshot = await this.db.collection(collection).where(field, operator, value).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async syncTransaction(userId, transaction) {
        await this.saveToFirestore('transactions', `${userId}_${transaction.id}`, {
            ...transaction,
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    async syncBudget(userId, budget) {
        await this.saveToFirestore('budgets', `${userId}_${budget.id}`, {
            ...budget,
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    async verifyIdToken(idToken) {
        return await this.auth.verifyIdToken(idToken);
    }
    async createCustomToken(uid) {
        return await this.auth.createCustomToken(uid);
    }
    async getUserByEmail(email) {
        return await this.auth.getUserByEmail(email);
    }
    async createUser(email, password, displayName) {
        return await this.auth.createUser({
            email,
            password,
            displayName,
        });
    }
    async deleteUser(uid) {
        await this.auth.deleteUser(uid);
    }
    async sendPushNotification(token, title, body, data) {
        const message = {
            notification: {
                title,
                body,
            },
            data,
            token,
        };
        return await this.messaging.send(message);
    }
    async sendMulticastNotification(tokens, title, body, data) {
        const message = {
            notification: {
                title,
                body,
            },
            data,
            tokens,
        };
        return await this.messaging.sendEachForMulticast(message);
    }
    async sendTopicNotification(topic, title, body, data) {
        const message = {
            notification: {
                title,
                body,
            },
            data,
            topic,
        };
        return await this.messaging.send(message);
    }
    async subscribeToTopic(tokens, topic) {
        return await this.messaging.subscribeToTopic(tokens, topic);
    }
    async unsubscribeFromTopic(tokens, topic) {
        return await this.messaging.unsubscribeFromTopic(tokens, topic);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map