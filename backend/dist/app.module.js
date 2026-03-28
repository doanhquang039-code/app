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
const auth_module_1 = require("./modules/auth/auth.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const categories_module_1 = require("./modules/categories/categories.module");
const reports_module_1 = require("./modules/reports/reports.module");
const schedule_1 = require("@nestjs/schedule");
const mailer_1 = require("@nestjs-modules/mailer");
const notifications_module_1 = require("./modules/notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mssql',
                host: 'localhost',
                port: 1433,
                username: 'sa',
                password: '123456789',
                database: 'ExpenseTrackerDB',
                entities: [user_entity_1.User, wallet_entity_1.Wallet, category_entity_1.Category, transaction_entity_1.Transaction],
                synchronize: false,
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS,
                    },
                },
            }),
            auth_module_1.AuthModule,
            transactions_module_1.TransactionsModule,
            categories_module_1.CategoriesModule,
            reports_module_1.ReportsModule,
            notifications_module_1.NotificationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map