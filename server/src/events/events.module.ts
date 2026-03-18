import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User]), TagsModule],
  controllers: [EventsController],
  providers: [EventsService, OptionalJwtAuthGuard],
  exports: [EventsService],
})
export class EventsModule {}
