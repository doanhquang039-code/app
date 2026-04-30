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
exports.AIAdvisorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const ai_advisor_service_1 = require("./ai-advisor.service");
class ChatMessageDto {
    message;
}
let AIAdvisorController = class AIAdvisorController {
    aiAdvisorService;
    constructor(aiAdvisorService) {
        this.aiAdvisorService = aiAdvisorService;
    }
    async getInsights(req) {
        return this.aiAdvisorService.getFinancialInsights(req.user.userId);
    }
    async chat(req, dto) {
        const response = await this.aiAdvisorService.getChatbotResponse(req.user.userId, dto.message);
        return { response };
    }
};
exports.AIAdvisorController = AIAdvisorController;
__decorate([
    (0, common_1.Get)('insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy insights tài chính từ AI' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIAdvisorController.prototype, "getInsights", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Chat với AI advisor' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChatMessageDto]),
    __metadata("design:returntype", Promise)
], AIAdvisorController.prototype, "chat", null);
exports.AIAdvisorController = AIAdvisorController = __decorate([
    (0, swagger_1.ApiTags)('ai-advisor'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('ai-advisor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_advisor_service_1.AIAdvisorService])
], AIAdvisorController);
//# sourceMappingURL=ai-advisor.controller.js.map