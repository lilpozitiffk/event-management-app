import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../entities/user.entity';
import { EventResponseDto, EventUserDto } from './dto/event-response.dto';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private tagsService: TagsService,
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
            tags: (event.tags || []).map(t => ({ id: t.id, name: t.name })),
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
        const { tagIds, ...eventData } = createEventDto;
        const newEvent = this.eventsRepository.create({
            ...eventData,
            description: eventData.description?.trim() || 'No description provided',
            organizer,
        });
        if (tagIds?.length) {
            newEvent.tags = await this.tagsService.findByIds(tagIds);
        }
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

    async findAll(user?: User, search?: string, tags?: string, page = 1, limit = 12) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 50);
        const skip = (safePage - 1) * safeLimit;

        const queryBuilder = this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .leftJoinAndSelect('event.tags', 'tag')
            .where('event.isPublic = :isPublic', { isPublic: true });

        if (search) {
            queryBuilder.andWhere(
                '(event.title ILIKE :search OR event.description ILIKE :search OR event.location ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (tags) {
            const tagIds = tags.split(',').map(Number).filter(Boolean);
            if (tagIds.length > 0) {
                queryBuilder
                    .innerJoin('event.tags', 'filterTag')
                    .andWhere('filterTag.id IN (:...tagIds)', { tagIds });
            }
        }

        const [events, total] = await queryBuilder
            .orderBy('event.date', 'ASC')
            .skip(skip)
            .take(safeLimit)
            .getManyAndCount();

        return {
            data: events.map((event) => this.mapEvent(event, user)),
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
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

    async getUserEvents(userId: number, page = 1, limit = 12) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const skip = (safePage - 1) * safeLimit;

        const [events, total] = await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.participants', 'participant')
            .leftJoinAndSelect('event.organizer', 'organizer')
            .leftJoinAndSelect('event.tags', 'tag')
            .where('participant.id = :userId', { userId })
            .orWhere('event.organizerId = :userId', { userId })
            .orderBy('event.date', 'ASC')
            .skip(skip)
            .take(safeLimit)
            .getManyAndCount();

        return {
            data: events.map((event) => this.mapEvent(event, { id: userId } as User)),
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
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
        const { tagIds, ...updateData } = updateEventDto;
        await this.eventsRepository.update(id, updateData);
        if (tagIds !== undefined) {
            const eventEntity = await this.eventsRepository.findOne({
                where: { id },
                relations: ['tags'],
            });
            eventEntity!.tags = tagIds.length
                ? await this.tagsService.findByIds(tagIds)
                : [];
            await this.eventsRepository.save(eventEntity!);
        }
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
