import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    return this.eventsService.update(+id, updateEventDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.delete(+id, req.user.userId);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  joinEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.joinEvent(+id, req.user.userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  leaveEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.leaveEvent(+id, req.user.userId);
  }

  @Get('users/me/events')
  @UseGuards(AuthGuard('jwt'))
  findUserEvents(@Request() req) {
    return this.eventsService.findUserEvents(req.user.userId);
  }
}
