import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { EventsModule } from '../events/events.module';
import { TagsModule } from '../tags/tags.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), EventsModule, TagsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
