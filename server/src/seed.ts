import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { EventsService } from './events/events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const eventsService = app.get(EventsService);

  const user1 = await usersService.create({
    name: 'John Doe',
    email: 'john12@example.com',
    password: 'password123',
  });

  const user2 = await usersService.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  });

  console.log('Users created:', user1.email, user2.email);

  // Create tags
  const tagRepo = app.get<Repository<Tag>>(getRepositoryToken(Tag));
  const tagNames = ['tech', 'art', 'business', 'music', 'sports', 'education'];
  const tags = await tagRepo.save(tagNames.map(name => tagRepo.create({ name })));
  console.log('Tags created:', tags.map(t => t.name).join(', '));

  const tagMap = Object.fromEntries(tags.map(t => [t.name, t.id]));

  const event1 = await eventsService.create(
    {
      title: 'Tech Conference 2026',
      description: 'Annual technology conference with industry leaders',
      date: '2026-11-15',
      time: '09:00',
      location: 'Convention Center, San Francisco',
      capacity: 500,
      isPublic: true,
      tagIds: [tagMap.tech, tagMap.business],
    },
    user1.id
  );

  const event2 = await eventsService.create(
    {
      title: 'Community Networking Meetup',
      description: 'Connect with local professionals and expand your network',
      date: '2026-10-20',
      time: '18:30',
      location: 'Downtown Coffee Shop',
      capacity: 30,
      isPublic: true,
      tagIds: [tagMap.business],
    },
    user2.id
  );

  const event3 = await eventsService.create(
    {
      title: 'Design Workshop',
      description: 'Hands-on workshop for UI/UX designers',
      date: '2026-10-25',
      time: '14:00',
      location: 'Creative Space Studio',
      capacity: 20,
      isPublic: true,
      tagIds: [tagMap.art, tagMap.tech],
    },
    user1.id
  );

  console.log('Events created:', event1.title, event2.title, event3.title);

  await app.close();
  console.log('Seeding completed!');
}

bootstrap().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});