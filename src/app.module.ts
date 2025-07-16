import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UrlsModule } from './modules/urls/urls.module';
import { User } from './modules/auth/domain/entities/user.entity';
import { Url } from './modules/urls/domain/entities/url.entity';
import { DatabaseService } from './database/database.service';
import { LoggingModule } from './shared/infrastructure/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'encurtador_url'),
        entities: [User, Url],
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        migrations: [join(__dirname, 'database', 'migrations', '*{.ts,.js}')],
        migrationsRun: false,
        migrationsTableName: 'migrations',
      }),
      inject: [ConfigService],
    }),
    LoggingModule,
    AuthModule,
    UrlsModule,
  ],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule { }
