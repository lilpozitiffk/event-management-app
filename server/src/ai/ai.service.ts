import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Event } from '../entities/event.entity';
import { EventsService } from '../events/events.service';
import { EventResponseDto } from '../events/dto/event-response.dto';
import { TagsService } from '../tags/tags.service';
import { agentTools } from './tools';

interface ToolArgs {
  role?: string;
  timeframe?: string;
  tag?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  eventTitle?: string;
  offset?: number;
}

const AI_PAGE_SIZE = 10;

interface AIEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  tags: { id: number; name: string }[];
  participantsCount: number;
  [key: string]: unknown;
}

interface AIEventWithRole extends AIEvent {
  role: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private eventsService: EventsService,
    private tagsService: TagsService,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async ask(userId: number, question: string, history: { role: string; content: string }[] = []): Promise<string> {
    const today = new Date();
    const systemPrompt = `CRITICAL RULE: You MUST respond in the SAME language as the user's latest message. If the user writes in Ukrainian, respond in Ukrainian. If in English, respond in English. For any other language, respond in English. This rule overrides everything else.

You are a friendly AI assistant for an event management application.
You help users find information about their events. You can ONLY READ data — you absolutely CANNOT create, edit, or delete anything.
Today's date is ${today.toISOString().split('T')[0]}.
Current day of week: ${today.toLocaleDateString('en-US', { weekday: 'long' })}.

CRITICAL — Write operation requests:
- If the user asks you to CREATE, ADD, EDIT, UPDATE, DELETE, REMOVE, or CANCEL an event (or any other data), you MUST clearly refuse and explain that you are a read-only assistant.
- Example responses: "I'm sorry, I can only help you find and view event information. I cannot create, edit, or delete events. Please use the app interface for that." or in Ukrainian: "Вибачте, я можу лише допомогти знайти та переглянути інформацію про події. Я не можу створювати, редагувати чи видаляти події. Будь ласка, використовуйте інтерфейс додатку для цього."
- NEVER respond with "Okay!" or any confirmation that implies the action was performed or accepted.

Response rules:
- Use markdown formatting: **bold** for event names, bullet lists, tables when appropriate.
- When listing events, use a numbered list with this format:
  1. **Event Name** — Date, Time, Location
     Tags: tag1, tag2 | Participants: N
- Tool results include pagination info (total, showing, hasMore). Show ALL events from the tool result — they are already limited to 10 per page.
- If "hasMore" is true, add at the end: "Showing X of N events. Ask me to show more if needed."
- If the user asks "show more" / "покажи ще" / "next" etc., call the same tool again with offset increased by 10.
- For a single event, describe it with details using bold labels.
- Keep responses concise but informative.
- After answering, suggest a SHORT follow-up question that you CAN actually answer using your available tools (event lookups, listing, filtering). Never suggest actions you cannot perform (like registering, creating, editing, or deleting events).
- Tag names in the system are in English (e.g. "tech", "business", "music", "art", "sports", "education"). When the user mentions a tag in another language, translate it to English before filtering.
- If the user says "no", "ні", or declines a suggestion, respond politely like "Okay! Let me know if you need anything else." in the user's language. Do NOT say you didn't understand.
If the question is truly unclear or unsupported, respond in the user's language: "Sorry, I didn't understand that. Please try rephrasing your question."`;

    const recentHistory = history.slice(-10);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system' as const, content: systemPrompt },
      ...recentHistory.map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
      { role: 'user' as const, content: question },
    ];

    for (let i = 0; i < 3; i++) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: agentTools,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === 'stop') {
        return choice.message.content || 'No response generated.';
      }

      if (choice.finish_reason === 'tool_calls') {
        messages.push(choice.message as ChatCompletionMessageParam);

        for (const toolCall of choice.message.tool_calls || []) {
          if (toolCall.type !== 'function') continue;
          const fn = toolCall.function;
          const args: ToolArgs = JSON.parse(fn.arguments);
          let result: string;

          switch (fn.name) {
            case 'getUserEvents':
              result = await this.executeGetUserEvents(userId, args);
              break;
            case 'getEventDetails':
              result = await this.executeGetEventDetails(userId, args);
              break;
            case 'getPublicEvents':
              result = await this.executeGetPublicEvents(args);
              break;
            case 'countUserEvents':
              result = await this.executeCountUserEvents(userId, args);
              break;
            default:
              result = JSON.stringify({ error: 'Unknown tool' });
          }

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result,
          });
        }
      }
    }

    return "Sorry, I couldn't process your request. Please try again.";
  }

  private getDateRange(timeframe: string): { start: Date; end: Date } | null {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();

    switch (timeframe) {
      case 'today': {
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { start: now, end };
      }
      case 'this_week': {
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'this_weekend': {
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + (6 - dayOfWeek));
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        sunday.setHours(23, 59, 59, 999);
        return { start: saturday, end: sunday };
      }
      case 'this_month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'next_week': {
        const start = new Date(now);
        start.setDate(now.getDate() + (7 - dayOfWeek));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'next_month': {
        const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'upcoming': {
        const end = new Date('2099-12-31');
        return { start: now, end };
      }
      case 'past': {
        const start = new Date('2000-01-01');
        const end = new Date(now);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      default:
        return null;
    }
  }

  private filterByDate<T extends { date: string }>(events: T[], args: ToolArgs): T[] {
    if (args.date) {
      return events.filter((e) => e.date === args.date);
    }
    if (args.dateFrom && args.dateTo) {
      const from = args.dateFrom;
      const to = args.dateTo;
      return events.filter((e) => e.date >= from && e.date <= to);
    }
    if (args.dateFrom) {
      const from = args.dateFrom;
      return events.filter((e) => e.date >= from);
    }
    if (args.dateTo) {
      const to = args.dateTo;
      return events.filter((e) => e.date <= to);
    }
    return events;
  }

  private filterByTimeframe<T extends { date: string }>(events: T[], timeframe?: string): T[] {
    if (!timeframe || timeframe === 'all') return events;
    const range = this.getDateRange(timeframe);
    if (!range) return events;

    return events.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= range.start && eventDate <= range.end;
    });
  }

  private async getAllUserEvents(userId: number): Promise<EventResponseDto[]> {
    const allEvents: EventResponseDto[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const result = await this.eventsService.getUserEvents(userId, page, 10);
      allEvents.push(...result.data);
      totalPages = result.meta.totalPages;
      page++;
    } while (page <= totalPages);
    return allEvents;
  }

  private async executeGetUserEvents(userId: number, args: ToolArgs): Promise<string> {
    const allEvents = await this.getAllUserEvents(userId);

    let filtered = allEvents.map((e) => ({
      ...e,
      role: e.isOrganizer ? 'organizer' : 'participant',
    }));

    if (args.role && args.role !== 'all') {
      filtered = filtered.filter((e) => e.role === args.role);
    }

    filtered = this.filterByTimeframe(filtered, args.timeframe);

    filtered = this.filterByDate(filtered, args);

    if (args.tag) {
      const tagLower = args.tag.toLowerCase();
      filtered = filtered.filter((e) =>
        (e.tags || []).some((t) => t.name.toLowerCase() === tagLower),
      );
    }

    const total = filtered.length;
    const offset = args.offset || 0;
    const page = filtered.slice(offset, offset + AI_PAGE_SIZE);

    return JSON.stringify({
      total,
      showing: { from: offset + 1, to: offset + page.length },
      hasMore: offset + AI_PAGE_SIZE < total,
      events: page.map((e) => ({
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        tags: (e.tags || []).map((t) => t.name),
        role: e.role,
        participantsCount: e.participantsCount,
      })),
    });
  }

  private async executeGetEventDetails(userId: number, args: ToolArgs): Promise<string> {
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.tags', 'tag')
      .where('event.title ILIKE :title', { title: `%${args.eventTitle}%` })
      .getMany();

    if (events.length === 0) {
      return JSON.stringify({ message: 'No event found with that title.' });
    }

    return JSON.stringify(
      events.map((e) => ({
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        capacity: e.capacity,
        isPublic: e.isPublic,
        organizer: e.organizer?.name,
        tags: (e.tags || []).map((t) => t.name),
        participants: (e.participants || []).map((p) => p.name),
        participantsCount: (e.participants || []).length,
      })),
    );
  }

  private async executeGetPublicEvents(args: ToolArgs): Promise<string> {
    const allEvents: EventResponseDto[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const result = await this.eventsService.findAll(undefined, args.search, undefined, page, 10);
      allEvents.push(...result.data);
      totalPages = result.meta.totalPages;
      page++;
    } while (page <= totalPages);

    let filtered = [...allEvents];

    filtered = this.filterByTimeframe(filtered, args.timeframe);

    filtered = this.filterByDate(filtered, args);

    if (args.tag) {
      const tagLower = args.tag.toLowerCase();
      filtered = filtered.filter((e) =>
        (e.tags || []).some((t) => t.name.toLowerCase() === tagLower),
      );
    }

    const total = filtered.length;
    const offset = args.offset || 0;
    const slice = filtered.slice(offset, offset + AI_PAGE_SIZE);

    return JSON.stringify({
      total,
      showing: { from: offset + 1, to: offset + slice.length },
      hasMore: offset + AI_PAGE_SIZE < total,
      events: slice.map((e) => ({
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        tags: (e.tags || []).map((t) => t.name),
        participantsCount: e.participantsCount,
      })),
    });
  }

  private async executeCountUserEvents(userId: number, args: ToolArgs): Promise<string> {
    const allEvents = await this.getAllUserEvents(userId);

    let filtered = allEvents.map((e) => ({
      ...e,
      role: e.isOrganizer ? 'organizer' : 'participant',
    }));

    if (args.role && args.role !== 'all') {
      filtered = filtered.filter((e) => e.role === args.role);
    }

    return JSON.stringify({
      total: filtered.length,
      asOrganizer: filtered.filter((e) => e.role === 'organizer').length,
      asParticipant: filtered.filter((e) => e.role === 'participant').length,
      events: filtered.map((e) => ({
        title: e.title,
        date: e.date,
        role: e.role,
      })),
    });
  }
}
