import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user || null; 
    return this.eventsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const user = req.user || null;
    return this.eventsService.findOne(+id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    return this.eventsService.update(+id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(+id, req.user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  join(@Param('id') id: string, @Request() req) {
    return this.eventsService.join(+id, req.user.id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  leave(@Param('id') id: string, @Request() req) {
    return this.eventsService.leave(+id, req.user.id);
  }
}
