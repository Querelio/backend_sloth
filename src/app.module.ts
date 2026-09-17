import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { ClassesModule } from './classes/classes.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { UsersModule } from './users/users.module';
import { ContractsModule } from './contracts/contracts.module';
import { PricingModeModule } from './pricing-mode/pricing-mode.module';
import { SessionsModule } from './sessions/sessions.module';
import { AgendaModule } from './agenda/agenda.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClassesModule,
    InstitutionsModule,
    UsersModule,
    ContractsModule,
    PricingModeModule,
    StatusModule,
    SessionsModule,
    AgendaModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
