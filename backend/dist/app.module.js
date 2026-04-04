"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const wallet_entity_1 = require("./entities/wallet.entity");
const category_entity_1 = require("./entities/category.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const budget_entity_1 = require("./entities/budget.entity");
const recurring_transaction_entity_1 = require("./entities/recurring-transaction.entity");
const savings_goal_entity_1 = require("./entities/savings-goal.entity");
const tag_entity_1 = require("./entities/tag.entity");
const budget_alert_entity_1 = require("./entities/budget-alert.entity");
const bill_reminder_entity_1 = require("./entities/bill-reminder.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const categories_module_1 = require("./modules/categories/categories.module");
const reports_module_1 = require("./modules/reports/reports.module");
const schedule_1 = require("@nestjs/schedule");
const mailer_1 = require("@nestjs-modules/mailer");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const budgets_module_1 = require("./modules/budgets/budgets.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const users_module_1 = require("./modules/users/users.module");
const recurring_transactions_module_1 = require("./modules/recurring-transactions/recurring-transactions.module");
const savings_goals_module_1 = require("./modules/savings-goals/savings-goals.module");
const tags_module_1 = require("./modules/tags/tags.module");
const budget_alerts_module_1 = require("./modules/budget-alerts/budget-alerts.module");
const duplicate_detection_module_1 = require("./modules/duplicate-detection/duplicate-detection.module");
const bill_reminders_module_1 = require("./modules/bill-reminders/bill-reminders.module");
const financial_insights_module_1 = require("./modules/financial-insights/financial-insights.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mssql',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: parseInt(configService.get('DB_PORT', '1433')),
                    username: configService.get('DB_USERNAME', 'sa'),
                    password: configService.get('DB_PASSWORD', '123456789'),
                    database: configService.get('DB_DATABASE', 'ExpenseTrackerDB'),
                    entities: [user_entity_1.User, wallet_entity_1.Wallet, category_entity_1.Category, transaction_entity_1.Transaction, budget_entity_1.Budget, recurring_transaction_entity_1.RecurringTransaction, savings_goal_entity_1.SavingsGoal, tag_entity_1.Tag, budget_alert_entity_1.BudgetAlert, bill_reminder_entity_1.BillReminder],
                    synchronize: false,
                    options: {
                        encrypt: false,
                        trustServerCertificate: true,
                    },
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    transport: {
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user: configService.get('MAIL_USER'),
                            pass: configService.get('MAIL_PASS'),
                        },
                    },
                }),
            }),
            auth_module_1.AuthModule,
            transactions_module_1.TransactionsModule,
            categories_module_1.CategoriesModule,
            reports_module_1.ReportsModule,
            notifications_module_1.NotificationsModule,
            wallets_module_1.WalletsModule,
            budgets_module_1.BudgetsModule,
            dashboard_module_1.DashboardModule,
            users_module_1.UsersModule,
            recurring_transactions_module_1.RecurringTransactionsModule,
            savings_goals_module_1.SavingsGoalsModule,
            tags_module_1.TagsModule,
            budget_alerts_module_1.BudgetAlertsModule,
            duplicate_detection_module_1.DuplicateDetectionModule,
            bill_reminders_module_1.BillRemindersModule,
            financial_insights_module_1.FinancialInsightsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map