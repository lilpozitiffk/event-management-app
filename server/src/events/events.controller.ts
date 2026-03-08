import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public events' })
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single event by ID' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new event' })
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', example: 1 })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    return this.eventsService.update(+id, updateEventDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.delete(+id, req.user.userId);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join an event' })
  @ApiParam({ name: 'id', example: 1 })
  joinEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.joinEvent(+id, req.user.userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave an event' })
  @ApiParam({ name: 'id', example: 1 })
  leaveEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.leaveEvent(+id, req.user.userId);
  }

  @Get('users/me/events')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my events (calendar)' })
  findUserEvents(@Request() req) {
    return this.eventsService.findUserEvents(req.user.userId);
  }
}
