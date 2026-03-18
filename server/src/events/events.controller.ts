import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Request,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { createEventSchema, updateEventSchema } from './schemas/event.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new event' })
  @UsePipes(new YupValidationPipe(createEventSchema))
  async create(@Body() createEventDto: CreateEventDto, @Request() req: { user: { id: number } }) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Fetch public events' })
  async findAll(@Query('search') search?: string, @Query('tags') tags?: string, @Request() req?: { user?: { id: number } }) {
    const user = req?.user ? ({ id: req.user.id } as any) : undefined;
    return this.eventsService.findAll(user, search, tags);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Fetch single event' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req?: { user?: { id: number } }) {
    const user = req?.user ? ({ id: req.user.id } as any) : undefined;
    return this.eventsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit event' })
  @UsePipes(new YupValidationPipe(updateEventSchema))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: { user: { id: number } },
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: { id: number } }) {
    return this.eventsService.remove(id, req.user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join event' })
  async join(@Param('id', ParseIntPipe) id: number, @Request() req: { user: { id: number } }) {
    return this.eventsService.join(id, req.user.id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave event' })
  async leave(@Param('id', ParseIntPipe) id: number, @Request() req: { user: { id: number } }) {
    return this.eventsService.leave(id, req.user.id);
  }
}
