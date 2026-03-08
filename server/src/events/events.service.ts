import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// FIX: Point to shared entities folder
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
// FIX: Point to shared entities folder
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
    throw new NotFoundException(`User #${userId} not found`);
  }

  const newEvent = this.eventsRepository.create({
    ...createEventDto,
    organizer,
  });
  return this.eventsRepository.save(newEvent);
}


  async findAll(user?: User) {
    const events = await this.eventsRepository.find({
      where: { isPublic: true },
      relations: ['participants', 'organizer'],
      order: { date: 'ASC' },
    });

    return events.map(event => {
      const isFull = event.capacity && event.participants.length >= event.capacity;
      const isJoined = user ? event.participants.some(p => p.id === user.id) : false;

      return {
        ...event,
        participantsCount: event.participants.length,
        isJoined,
        isFull,
      };
    });
  }

  async findOne(id: number, user?: User) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['participants', 'organizer'],
    });

    if (!event) throw new NotFoundException(`Event #${id} not found`);

    const isFull = event.capacity && event.participants.length >= event.capacity;
    const isJoined = user ? event.participants.some(p => p.id === user.id) : false;
    const isOrganizer = user ? user.id === event.organizer.id : false;

    return {
      ...event,
      participantsCount: event.participants.length,
      isJoined,
      isFull,
      isOrganizer,
    };
  }

  async join(eventId: number, userId: number) {
    // We need to fetch the event again to check status fresh
    const event = await this.eventsRepository.findOne({
        where: { id: eventId },
        relations: ['participants']
    });
    
    if (!event) throw new NotFoundException('Event not found');
    if (event.capacity && event.participants.length >= event.capacity) throw new ConflictException('Event is full');
    
    const isJoined = event.participants.some(p => p.id === userId);
    if (isJoined) throw new ConflictException('Already joined');

    await this.eventsRepository
        .createQueryBuilder()
        .relation(Event, "participants")
        .of(eventId)
        .add(userId);

    return this.findOne(eventId);
  }

  async leave(eventId: number, userId: number) {
    const event = await this.eventsRepository.findOne({
        where: { id: eventId },
        relations: ['participants']
    });

    if (!event) throw new NotFoundException('Event not found');

    const isJoined = event.participants.some(p => p.id === userId);
    if (!isJoined) throw new ConflictException('Not joined yet');

    await this.eventsRepository
        .createQueryBuilder()
        .relation(Event, "participants")
        .of(eventId)
        .remove(userId);

    return this.findOne(eventId);
  }

  async update(id: number, updateEventDto: UpdateEventDto, userId: number) {
    const event = await this.findOne(id);
    if (event.organizer.id !== userId) {
      throw new BadRequestException('You are not the organizer');
    }
    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const event = await this.findOne(id);
    if (event.organizer.id !== userId) {
      throw new BadRequestException('You are not the organizer');
    }
    await this.eventsRepository.delete(id);
  }
}
