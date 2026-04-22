"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Expense Tracker API')
        .setDescription('API quản lý chi tiêu cá nhân — Expense Tracker App')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
        .addTag('auth', 'Xác thực người dùng')
        .addTag('transactions', 'Quản lý giao dịch')
        .addTag('wallets', 'Quản lý ví')
        .addTag('categories', 'Danh mục')
        .addTag('budgets', 'Ngân sách')
        .addTag('savings-goals', 'Mục tiêu tiết kiệm')
        .addTag('bill-reminders', 'Nhắc nhở hóa đơn')
        .addTag('recurring-transactions', 'Giao dịch định kỳ')
        .addTag('dashboard', 'Dashboard tổng quan')
        .addTag('analytics', 'Phân tích tài chính')
        .addTag('reports', 'Báo cáo')
        .addTag('financial-reports', 'Báo cáo tài chính')
        .addTag('bank-accounts', 'Tài khoản ngân hàng')
        .addTag('credit-cards', 'Thẻ tín dụng')
        .addTag('shared-expenses', 'Chi tiêu nhóm')
        .addTag('multi-currency', 'Đa tiền tệ')
        .addTag('debts', 'Quản lý nợ')
        .addTag('investments', 'Đầu tư')
        .addTag('net-worth', 'Tài sản ròng')
        .addTag('notifications', 'Thông báo')
        .addTag('users', 'Người dùng')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    await app.listen(3000);
    console.log(`🚀 Server đang chạy tại http://localhost:3000`);
    console.log(`📚 Swagger docs: http://localhost:3000/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map