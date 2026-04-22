import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS cho mobile app
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('API quản lý chi tiêu cá nhân — Expense Tracker App')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
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