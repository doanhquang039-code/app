import { User } from './user.entity';
export declare class VoiceCommand {
    id: number;
    userId: number;
    user: User;
    originalText: string;
    processedText: string;
    intent: string;
    entities: string;
    confidence: number;
    status: string;
    actionTaken: string;
    relatedEntityId: number;
    relatedEntityType: string;
    response: string;
    audioFilePath: string;
    audioDuration: number;
    language: string;
    deviceType: string;
    errorMessage: string;
    createdAt: Date;
}
