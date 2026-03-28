import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendReminder(req: any): Promise<{
        message: string;
    }>;
}
