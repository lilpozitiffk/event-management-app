import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: number) {

    const eventDateTime = new Date(`${createEventDto.date}T${createEventDto.time}`);
    if (eventDateTime < new Date()) {
      throw new BadRequestException('Cannot create events in the past');
    }

    const organizer = await this.usersRepository.findOne({ where: { id: userId } });
    if (!organizer) {
      throw new NotFoundException('User not found');
    }

    const event = this.eventsRepository.create({
      ...createEventDto,
      organizer,
      organizerId: userId,
    });

    return this.eventsRepository.save(event);
  }

  async findAllPublic() {
    return this.eventsRepository.find({
      where: { isPublic: true },
      relations: ['organizer', 'participants'],
    });
  }

  async findOne(id: number) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, userId: number) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can edit this event');
    }

    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async delete(id: number, userId: number) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can delete this event');
    }

    await this.eventsRepository.delete(id);
    return { message: 'Event deleted successfully' };
  }

  async joinEvent(eventId: number, userId: number) {
    const event = await this.findOne(eventId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyJoined = event.participants.some(p => p.id === userId);
    if (alreadyJoined) {
      throw new BadRequestException('Already joined this event');
    }

    if (event.capacity && event.participants.length >= event.capacity) {
      throw new BadRequestException('Event is full');
    }

    event.participants.push(user);
    return this.eventsRepository.save(event);
  }

  async leaveEvent(eventId: number, userId: number) {
    const event = await this.findOne(eventId);

    const alreadyJoined = event.participants.some(p => p.id === userId);
    if (!alreadyJoined) {
      throw new BadRequestException('You have not joined this event');
    }

    event.participants = event.participants.filter(p => p.id !== userId);
    return this.eventsRepository.save(event);
  }

  async findUserEvents(userId: number) {
    return this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .where('event.organizerId = :userId', { userId })
      .orWhere('participants.id = :userId', { userId })
      .getMany();
  }
}
