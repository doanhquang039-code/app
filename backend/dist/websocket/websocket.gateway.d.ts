import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAuthenticate(data: {
        userId: string;
    }, client: Socket): {
        event: string;
        data: {
            success: boolean;
        };
    };
    emitTransactionCreated(userId: string, transaction: any): void;
    emitTransactionUpdated(userId: string, transaction: any): void;
    emitTransactionDeleted(userId: string, transactionId: number): void;
    emitBudgetAlert(userId: string, alert: any): void;
    emitSavingsProgress(userId: string, goal: any): void;
    emitNotification(userId: string, notification: any): void;
    broadcast(event: string, data: any): void;
}
