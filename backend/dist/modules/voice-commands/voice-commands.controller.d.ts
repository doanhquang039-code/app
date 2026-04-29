import { VoiceCommandsService } from './voice-commands.service';
export declare class VoiceCommandsController {
    private readonly voiceService;
    constructor(voiceService: VoiceCommandsService);
    processCommand(req: any, data: {
        text: string;
        language?: string;
    }): Promise<any>;
    getHistory(req: any): Promise<import("../../entities/voice-command.entity").VoiceCommand[]>;
    getSupportedIntents(): any[];
    findOne(req: any, id: number): Promise<import("../../entities/voice-command.entity").VoiceCommand>;
}
