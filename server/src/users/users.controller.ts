import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventsService } from '../events/events.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('me/events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Fetch user's events (calendar)" })
  async getMyEvents(@Request() req: { user: { id: number } }) {
    return this.eventsService.getUserEvents(req.user.id);
  }
}
