import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebsocketGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(client.id, data.userId);
    this.logger.log(`User authenticated: ${data.userId}`);
    return { event: 'authenticated', data: { success: true } };
  }

  // Emit transaction created
  emitTransactionCreated(userId: string, transaction: any) {
    this.server.emit(`transaction:created:${userId}`, transaction);
  }

  // Emit transaction updated
  emitTransactionUpdated(userId: string, transaction: any) {
    this.server.emit(`transaction:updated:${userId}`, transaction);
  }

  // Emit transaction deleted
  emitTransactionDeleted(userId: string, transactionId: number) {
    this.server.emit(`transaction:deleted:${userId}`, { id: transactionId });
  }

  // Emit budget alert
  emitBudgetAlert(userId: string, alert: any) {
    this.server.emit(`budget:alert:${userId}`, alert);
  }

  // Emit savings goal progress
  emitSavingsProgress(userId: string, goal: any) {
    this.server.emit(`savings:progress:${userId}`, goal);
  }

  // Emit notification
  emitNotification(userId: string, notification: any) {
    this.server.emit(`notification:${userId}`, notification);
  }

  // Broadcast to all users
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
