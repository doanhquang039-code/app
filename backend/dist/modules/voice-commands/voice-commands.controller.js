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
exports.VoiceCommandsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const voice_commands_service_1 = require("./voice-commands.service");
const swagger_1 = require("@nestjs/swagger");
let VoiceCommandsController = class VoiceCommandsController {
    voiceService;
    constructor(voiceService) {
        this.voiceService = voiceService;
    }
    async processCommand(req, data) {
        return await this.voiceService.processCommand(req.user.userId, data.text, data.language);
    }
    async getHistory(req) {
        return await this.voiceService.getHistory(req.user.userId);
    }
    getSupportedIntents() {
        return this.voiceService.getSupportedIntents();
    }
    async findOne(req, id) {
        return await this.voiceService.findOne(req.user.userId, id);
    }
};
exports.VoiceCommandsController = VoiceCommandsController;
__decorate([
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Xử lý lệnh giọng nói' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VoiceCommandsController.prototype, "processCommand", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch sử lệnh giọng nói' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoiceCommandsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('supported-intents'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách intent hỗ trợ' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VoiceCommandsController.prototype, "getSupportedIntents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết lệnh giọng nói' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VoiceCommandsController.prototype, "findOne", null);
exports.VoiceCommandsController = VoiceCommandsController = __decorate([
    (0, swagger_1.ApiTags)('Voice Commands'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('voice-commands'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [voice_commands_service_1.VoiceCommandsService])
], VoiceCommandsController);
//# sourceMappingURL=voice-commands.controller.js.map