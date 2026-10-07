"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const node_1 = require("better-auth/node");
const app_module_1 = require("./app.module");
const auth_1 = require("./auth/auth");
async function bootstrap() {
    // rawBody: true keeps the raw bytes for Paystack webhook verification.
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true, cors: { origin: process.env.WEB_URL ?? 'http://localhost:3000', credentials: true } });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api', { exclude: ['api/auth/(.*)'] });
    const express = app.getHttpAdapter().getInstance();
    express.use('/api/auth', (0, node_1.toNodeHandler)(auth_1.auth));
    await app.listen(process.env.PORT ?? 3001);
    console.log(`Trex API on :${process.env.PORT ?? 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map