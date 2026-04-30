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
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WebsocketGateway = class WebsocketGateway {
    server;
    logger = new common_1.Logger('WebsocketGateway');
    connectedUsers = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        const userId = this.connectedUsers.get(client.id);
        this.connectedUsers.delete(client.id);
        this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
    handleAuthenticate(data, client) {
        this.connectedUsers.set(client.id, data.userId);
        this.logger.log(`User authenticated: ${data.userId}`);
        return { event: 'authenticated', data: { success: true } };
    }
    emitTransactionCreated(userId, transaction) {
        this.server.emit(`transaction:created:${userId}`, transaction);
    }
    emitTransactionUpdated(userId, transaction) {
        this.server.emit(`transaction:updated:${userId}`, transaction);
    }
    emitTransactionDeleted(userId, transactionId) {
        this.server.emit(`transaction:deleted:${userId}`, { id: transactionId });
    }
    emitBudgetAlert(userId, alert) {
        this.server.emit(`budget:alert:${userId}`, alert);
    }
    emitSavingsProgress(userId, goal) {
        this.server.emit(`savings:progress:${userId}`, goal);
    }
    emitNotification(userId, notification) {
        this.server.emit(`notification:${userId}`, notification);
    }
    broadcast(event, data) {
        this.server.emit(event, data);
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('authenticate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleAuthenticate", null);
exports.WebsocketGateway = WebsocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map