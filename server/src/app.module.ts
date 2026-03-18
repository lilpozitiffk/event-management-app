import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { Tag } from './entities/tag.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...(process.env.SERVE_STATIC === 'true'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'client', 'dist'),
            exclude: ['/api*'],
          }),
        ]
      : []),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const useSsl = Boolean(databaseUrl);
        return {
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        url: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        entities: [User, Event, Tag],
        synchronize: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
