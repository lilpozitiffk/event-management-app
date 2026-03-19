import { IsString, IsNotEmpty, MaxLength, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

export class AskDto {
  @ApiProperty({ example: 'What events am I attending this week?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @ApiProperty({ required: false, type: [ChatMessageDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
