import { Controller, Post, Body, UseGuards, Request, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { AiService } from './ai.service';
import { AskDto } from './dto/ask.dto';
import { askSchema } from './schemas/ask.schema';

@ApiTags('AI Assistant')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask AI assistant a question about events' })
  @UsePipes(new YupValidationPipe(askSchema))
  async ask(@Body() askDto: AskDto, @Request() req: { user: { id: number } }) {
    const answer = await this.aiService.ask(req.user.id, askDto.question, askDto.history);
    return { answer };
  }
}
