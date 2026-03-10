import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../entities/user.entity';
import { EventResponseDto, EventUserDto } from './dto/event-response.dto';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    private mapEvent(event: Event, user?: User): EventResponseDto {
        const participants: EventUserDto[] = (event.participants || []).map((p) => ({
            id: p.id,
            name: p.name,
        }));
        const organizer: EventUserDto = {
            id: event.organizer?.id,
            name: event.organizer?.name,
        };
        const isFull = !!event.capacity && participants.length >= event.capacity;
        const isJoined = user ? participants.some((p) => p.id === user.id) : false;
        const isOrganizer = user ? user.id === event.organizer?.id : false;

        return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            capacity: event.capacity ?? null,
            isPublic: event.isPublic,
            participantsCount: participants.length,
            isJoined,
            isFull,
            isOrganizer,
            organizer,
            participants,
        };
    }

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
            description: createEventDto.description?.trim() || 'No description provided',
            organizer,
        });
        const saved = await this.eventsRepository.save(newEvent);
        const event = await this.eventsRepository.findOne({
            where: { id: saved.id },
            relations: ['participants', 'organizer'],
        });
        if (!event) {
            throw new NotFoundException(`Event #${saved.id} not found`);
        }
        return this.mapEvent(event, organizer);
    }

    async findAll(user?: User, search?: string) {
        const queryBuilder = this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .where('event.isPublic = :isPublic', { isPublic: true });

        if (search) {
            queryBuilder.andWhere(
                '(event.title ILIKE :search OR event.description ILIKE :search OR event.location ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        const events = await queryBuilder.orderBy('event.date', 'ASC').getMany();

        return events.map((event) => this.mapEvent(event, user));
    }

    async findOne(id: number, user?: User) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['participants', 'organizer'],
        });
        if (!event) throw new NotFoundException(`Event #${id} not found`);

        if (!event.isPublic) {
            const isOrganizer = !!user && user.id === event.organizer.id;
            const isParticipant = !!user && event.participants.some((p) => p.id === user.id);
            if (!isOrganizer && !isParticipant) {
                throw new ForbiddenException('Event is private');
            }
        }

        return this.mapEvent(event, user);
    }

    async getUserEvents(userId: number) {
        const events = await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .where('participant.id = :userId', { userId })
            .orWhere('event.organizerId = :userId', { userId })
            .orderBy('event.date', 'ASC')
            .getMany();

        return events.map((event) => this.mapEvent(event, { id: userId } as User));
    }

    async join(eventId: number, userId: number) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
            relations: ['participants', 'organizer']
        });
        if (!event) throw new NotFoundException('Event not found');
        if (event.organizer.id === userId) {
            throw new ConflictException('Organizer cannot join their own event');
        }
        if (event.capacity && event.participants.length >= event.capacity) {
            throw new ConflictException('Event is full');
        }
        if (!event.isPublic) {
            const isParticipant = event.participants.some((p) => p.id === userId);
            if (!isParticipant) {
                throw new ForbiddenException('Event is private');
            }
        }
        const isJoined = event.participants.some(p => p.id === userId);
        if (isJoined) throw new ConflictException('Already joined');
        await this.eventsRepository
            .createQueryBuilder()
            .relation(Event, "participants")
            .of(eventId)
            .add(userId);
        return this.findOne(eventId, { id: userId } as User);
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
        return this.findOne(eventId, { id: userId } as User);
    }

    async update(id: number, updateEventDto: UpdateEventDto, userId: number) {
        const event = await this.findOne(id, { id: userId } as User);
        if (event.organizer.id !== userId) {
            throw new BadRequestException('You are not the organizer');
        }
        const nextDate = updateEventDto.date ?? event.date;
        const nextTime = updateEventDto.time ?? event.time;
        const nextDateTime = new Date(`${nextDate}T${nextTime}`);
        if (nextDateTime < new Date()) {
            throw new BadRequestException('Cannot set event in the past');
        }
        await this.eventsRepository.update(id, updateEventDto);
        return this.findOne(id, { id: userId } as User);
    }

    async remove(id: number, userId: number) {
        const event = await this.findOne(id, { id: userId } as User);
        if (event.organizer.id !== userId) {
            throw new BadRequestException('You are not the organizer');
        }
        await this.eventsRepository.delete(id);
    }
}
