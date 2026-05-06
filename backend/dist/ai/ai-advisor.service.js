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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAdvisorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const transaction_entity_1 = require("../entities/transaction.entity");
const budget_entity_1 = require("../entities/budget.entity");
const savings_goal_entity_1 = require("../entities/savings-goal.entity");
let AIAdvisorService = class AIAdvisorService {
    transactionRepo;
    budgetRepo;
    savingsGoalRepo;
    configService;
    openai = null;
    useAI = false;
    constructor(transactionRepo, budgetRepo, savingsGoalRepo, configService) {
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
        this.savingsGoalRepo = savingsGoalRepo;
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey && apiKey !== 'your-openai-api-key-here') {
            this.openai = new openai_1.default({ apiKey });
            this.useAI = true;
            console.log('✅ OpenAI initialized successfully');
        }
        else {
            console.log('⚠️  OpenAI API key not found, using rule-based responses');
        }
    }
    async getFinancialInsights(userId) {
        const insights = [];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
            },
        });
        const spendingInsights = this.analyzeSpendingPatterns(transactions);
        insights.push(...spendingInsights);
        const budgetInsights = await this.analyzeBudgets(userId);
        insights.push(...budgetInsights);
        const savingsInsights = await this.analyzeSavingsGoals(userId);
        insights.push(...savingsInsights);
        const predictions = this.predictFutureSpending(transactions);
        insights.push(...predictions);
        return insights.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    analyzeSpendingPatterns(transactions) {
        const insights = [];
        const totalSpending = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const categorySpending = transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => {
            const category = t.categoryId || 'other';
            acc[category] = (acc[category] || 0) + Number(t.amount);
            return acc;
        }, {});
        const highestCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];
        if (highestCategory && highestCategory[1] > totalSpending * 0.3) {
            insights.push({
                type: 'warning',
                title: 'Chi tiêu cao trong danh mục',
                message: `Bạn đã chi ${highestCategory[1].toLocaleString('vi-VN')}đ cho danh mục này, chiếm ${((highestCategory[1] / totalSpending) * 100).toFixed(1)}% tổng chi tiêu.`,
                priority: 'high',
                actionable: true,
                action: 'Xem chi tiết',
            });
        }
        const avgDailySpending = totalSpending / new Date().getDate();
        const recentSpending = transactions
            .filter((t) => t.type === 'expense' &&
            new Date(t.date) >
                new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
            .reduce((sum, t) => sum + Number(t.amount), 0);
        if (recentSpending > avgDailySpending * 3 * 1.5) {
            insights.push({
                type: 'warning',
                title: 'Chi tiêu tăng đột biến',
                message: `Chi tiêu 3 ngày qua cao hơn 50% so với mức trung bình. Hãy cân nhắc giảm chi tiêu!`,
                priority: 'high',
            });
        }
        if (totalSpending < avgDailySpending * 20) {
            insights.push({
                type: 'achievement',
                title: 'Tiết kiệm tốt! 🎉',
                message: `Bạn đang chi tiêu thấp hơn mức trung bình. Tiếp tục duy trì!`,
                priority: 'low',
            });
        }
        return insights;
    }
    async analyzeBudgets(userId) {
        const insights = [];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const budgets = await this.budgetRepo.find({
            where: { userId },
        });
        for (const budget of budgets) {
            const spent = await this.transactionRepo
                .createQueryBuilder('t')
                .where('t.userId = :userId', { userId })
                .andWhere('t.categoryId = :categoryId', {
                categoryId: budget.categoryId,
            })
                .andWhere('t.type = :type', { type: 'expense' })
                .andWhere('t.date >= :startDate', { startDate: startOfMonth })
                .select('SUM(t.amount)', 'total')
                .getRawOne();
            const spentAmount = Number(spent?.total || 0);
            const percentage = (spentAmount / Number(budget.amount)) * 100;
            if (percentage >= 90) {
                insights.push({
                    type: 'warning',
                    title: 'Ngân sách sắp vượt!',
                    message: `Bạn đã dùng ${percentage.toFixed(0)}% ngân sách cho danh mục này.`,
                    priority: 'high',
                    actionable: true,
                    action: 'Xem ngân sách',
                });
            }
            else if (percentage >= 70) {
                insights.push({
                    type: 'tip',
                    title: 'Cảnh báo ngân sách',
                    message: `Đã dùng ${percentage.toFixed(0)}% ngân sách. Hãy cân nhắc chi tiêu!`,
                    priority: 'medium',
                });
            }
        }
        return insights;
    }
    async analyzeSavingsGoals(userId) {
        const insights = [];
        const goals = await this.savingsGoalRepo.find({
            where: { userId, status: 'active' },
        });
        for (const goal of goals) {
            const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
            if (progress >= 75) {
                insights.push({
                    type: 'achievement',
                    title: 'Gần đạt mục tiêu! 🎯',
                    message: `Bạn đã đạt ${progress.toFixed(0)}% mục tiêu "${goal.name}". Còn ${(Number(goal.targetAmount) - Number(goal.currentAmount)).toLocaleString('vi-VN')}đ nữa!`,
                    priority: 'medium',
                    actionable: true,
                    action: 'Xem mục tiêu',
                });
            }
            if (goal.targetDate) {
                const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24));
                const amountLeft = Number(goal.targetAmount) - Number(goal.currentAmount);
                const dailyRequired = amountLeft / daysLeft;
                if (dailyRequired > 0 && daysLeft > 0 && daysLeft < 30) {
                    insights.push({
                        type: 'tip',
                        title: 'Tăng tốc tiết kiệm',
                        message: `Để đạt mục tiêu "${goal.name}", bạn cần tiết kiệm ${dailyRequired.toLocaleString('vi-VN')}đ/ngày trong ${daysLeft} ngày tới.`,
                        priority: 'medium',
                    });
                }
            }
        }
        return insights;
    }
    predictFutureSpending(transactions) {
        const insights = [];
        const expenses = transactions.filter((t) => t.type === 'expense');
        if (expenses.length === 0)
            return insights;
        const totalSpending = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const avgDailySpending = totalSpending / new Date().getDate();
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - new Date().getDate();
        const predictedTotal = totalSpending + avgDailySpending * daysLeft;
        insights.push({
            type: 'prediction',
            title: 'Dự đoán chi tiêu tháng này',
            message: `Dựa trên xu hướng hiện tại, bạn sẽ chi khoảng ${predictedTotal.toLocaleString('vi-VN')}đ trong tháng này.`,
            priority: 'low',
        });
        return insights;
    }
    async getChatbotResponse(userId, message) {
        if (this.useAI && this.openai) {
            return this.getAIChatResponse(userId, message);
        }
        return this.getRuleBasedResponse(userId, message);
    }
    async getAIChatResponse(userId, message) {
        try {
            if (!this.openai) {
                return this.getRuleBasedResponse(userId, message);
            }
            const context = await this.getUserFinancialContext(userId);
            const systemPrompt = `Bạn là một trợ lý tài chính AI thông minh, chuyên nghiệp và thân thiện. 
Nhiệm vụ của bạn là giúp người dùng quản lý tài chính cá nhân, đưa ra lời khuyên về chi tiêu, tiết kiệm và đầu tư.

Thông tin tài chính của người dùng:
${context}

Hãy trả lời bằng tiếng Việt, ngắn gọn (2-3 câu), thân thiện và hữu ích. 
Sử dụng emoji phù hợp để làm cho câu trả lời sinh động hơn.`;
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                temperature: 0.7,
                max_tokens: 300,
            });
            return (completion.choices[0]?.message?.content ||
                'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.');
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            return this.getRuleBasedResponse(userId, message);
        }
    }
    async getUserFinancialContext(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(startOfMonth, now),
            },
            take: 50,
        });
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const budgets = await this.budgetRepo.find({ where: { userId } });
        const goals = await this.savingsGoalRepo.find({
            where: { userId, status: 'active' },
        });
        return `
- Tháng này: Thu nhập ${totalIncome.toLocaleString('vi-VN')}đ, Chi tiêu ${totalExpense.toLocaleString('vi-VN')}đ
- Số giao dịch: ${transactions.length}
- Số ngân sách: ${budgets.length}
- Số mục tiêu tiết kiệm: ${goals.length}
- Tổng mục tiêu tiết kiệm: ${goals.reduce((sum, g) => sum + Number(g.targetAmount), 0).toLocaleString('vi-VN')}đ
    `.trim();
    }
    async getRuleBasedResponse(userId, message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('chi tiêu') ||
            lowerMessage.includes('spending')) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const transactions = await this.transactionRepo.find({
                where: {
                    userId,
                    type: 'expense',
                    date: (0, typeorm_2.Between)(startOfMonth, now),
                },
            });
            const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            return `💰 Tháng này bạn đã chi ${total.toLocaleString('vi-VN')}đ qua ${transactions.length} giao dịch.`;
        }
        if (lowerMessage.includes('tiết kiệm') || lowerMessage.includes('save')) {
            const goals = await this.savingsGoalRepo.find({
                where: { userId, status: 'active' },
            });
            if (goals.length === 0) {
                return '🎯 Bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu để bắt đầu!';
            }
            const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
            const totalCurrent = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
            return `🎯 Bạn có ${goals.length} mục tiêu tiết kiệm với tổng ${totalTarget.toLocaleString('vi-VN')}đ. Đã đạt ${totalCurrent.toLocaleString('vi-VN')}đ (${((totalCurrent / totalTarget) * 100).toFixed(1)}%).`;
        }
        if (lowerMessage.includes('ngân sách') || lowerMessage.includes('budget')) {
            const budgets = await this.budgetRepo.find({ where: { userId } });
            return `📊 Bạn có ${budgets.length} ngân sách đang hoạt động. Sử dụng lệnh "xem ngân sách" để biết chi tiết.`;
        }
        if (lowerMessage.includes('phân tích') ||
            lowerMessage.includes('analyze')) {
            const insights = await this.getFinancialInsights(userId);
            if (insights.length === 0) {
                return '✅ Tài chính của bạn đang ổn định! Không có cảnh báo nào.';
            }
            const topInsight = insights[0];
            return `${topInsight.type === 'warning' ? '⚠️' : '💡'} ${topInsight.title}: ${topInsight.message}`;
        }
        return '👋 Xin chào! Tôi có thể giúp bạn về: chi tiêu 💰, tiết kiệm 🎯, ngân sách 📊, và phân tích tài chính 📈. Bạn muốn biết gì?';
    }
};
exports.AIAdvisorService = AIAdvisorService;
exports.AIAdvisorService = AIAdvisorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(2, (0, typeorm_1.InjectRepository)(savings_goal_entity_1.SavingsGoal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], AIAdvisorService);
//# sourceMappingURL=ai-advisor.service.js.map