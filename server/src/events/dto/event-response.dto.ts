import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class EventResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  time: string;

  @ApiProperty()
  location: string;

  @ApiPropertyOptional({ nullable: true })
  capacity: number | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  participantsCount: number;

  @ApiProperty()
  isJoined: boolean;

  @ApiProperty()
  isFull: boolean;

  @ApiProperty()
  isOrganizer: boolean;

  @ApiProperty()
  organizer: EventUserDto;

  @ApiProperty({ type: [EventUserDto] })
  participants: EventUserDto[];

  @ApiProperty({ type: () => [EventTagDto] })
  tags: EventTagDto[];
}

export class EventTagDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
