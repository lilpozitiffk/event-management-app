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

  const events = [
    {
      title: 'Tech Conference 2026',
      description: 'Annual technology conference featuring keynote speeches from industry leaders, hands-on workshops, and networking opportunities. Topics include AI, cloud computing, and cybersecurity.',
      date: '2026-11-15',
      time: '09:00',
      location: 'Convention Center, San Francisco',
      capacity: 500,
      isPublic: true,
      tagIds: [tagMap.tech, tagMap.business],
      organizer: user1.id,
    },
    {
      title: 'Community Networking Meetup',
      description: 'An informal evening for local professionals to connect, share ideas, and explore collaboration opportunities. Light refreshments provided.',
      date: '2026-10-20',
      time: '18:30',
      location: 'Downtown Coffee Shop',
      capacity: 30,
      isPublic: true,
      tagIds: [tagMap.business],
      organizer: user2.id,
    },
    {
      title: 'Design Workshop: From Wireframe to Prototype',
      description: 'A hands-on workshop where participants build a complete UI prototype from scratch using Figma. Suitable for beginners and intermediate designers.',
      date: '2026-10-25',
      time: '14:00',
      location: 'Creative Space Studio',
      capacity: 20,
      isPublic: true,
      tagIds: [tagMap.art, tagMap.tech],
      organizer: user1.id,
    },
    {
      title: 'Startup Pitch Night',
      description: 'Watch 10 early-stage startups pitch their ideas to a panel of investors and mentors. Audience voting determines the People\'s Choice award.',
      date: '2026-09-18',
      time: '19:00',
      location: 'Innovation Hub, Austin',
      capacity: 150,
      isPublic: true,
      tagIds: [tagMap.business, tagMap.tech],
      organizer: user2.id,
    },
    {
      title: 'Jazz in the Park',
      description: 'An open-air jazz concert featuring local bands performing classic and contemporary jazz. Bring a blanket and enjoy the evening under the stars.',
      date: '2026-08-10',
      time: '18:00',
      location: 'Central Park, New York',
      capacity: undefined,
      isPublic: true,
      tagIds: [tagMap.music, tagMap.art],
      organizer: user1.id,
    },
    {
      title: 'Marathon Training Camp',
      description: 'A 3-hour guided training session for runners preparing for upcoming marathons. Coaches cover pacing strategies, nutrition tips, and injury prevention.',
      date: '2026-07-05',
      time: '06:30',
      location: 'Riverside Running Track, Chicago',
      capacity: 50,
      isPublic: true,
      tagIds: [tagMap.sports, tagMap.education],
      organizer: user2.id,
    },
    {
      title: 'Photography Masterclass',
      description: 'Learn composition, lighting, and post-processing techniques from a professional photographer. Bring your own camera or use one of ours.',
      date: '2026-09-12',
      time: '10:00',
      location: 'Art Gallery, London',
      capacity: 25,
      isPublic: true,
      tagIds: [tagMap.art, tagMap.education],
      organizer: user1.id,
    },
    {
      title: 'Indie Music Festival',
      description: 'A full-day festival showcasing 12 independent artists across two stages. Food trucks, merch booths, and a vinyl marketplace on site.',
      date: '2026-08-22',
      time: '12:00',
      location: 'Warehouse District, Berlin',
      capacity: 300,
      isPublic: true,
      tagIds: [tagMap.music],
      organizer: user2.id,
    },
    {
      title: 'Data Science Bootcamp',
      description: 'Intensive one-day bootcamp covering Python, pandas, and machine learning fundamentals. Participants work on a real-world dataset and present findings.',
      date: '2026-10-05',
      time: '09:00',
      location: 'Tech Campus, Seattle',
      capacity: 40,
      isPublic: true,
      tagIds: [tagMap.tech, tagMap.education],
      organizer: user1.id,
    },
    {
      title: 'Yoga & Mindfulness Retreat',
      description: 'A half-day retreat focused on stress relief through guided yoga sessions, breathing exercises, and mindfulness meditation.',
      date: '2026-07-20',
      time: '08:00',
      location: 'Lakeview Resort, Denver',
      capacity: 35,
      isPublic: true,
      tagIds: [tagMap.sports, tagMap.education],
      organizer: user2.id,
    },
    {
      title: 'E-Sports Championship Viewing Party',
      description: 'Watch the regional League of Legends finals on a big screen with fellow gamers. Prizes for trivia, cosplay contest, and free snacks.',
      date: '2026-11-02',
      time: '17:00',
      location: 'Gaming Lounge, Tokyo',
      capacity: 80,
      isPublic: true,
      tagIds: [tagMap.sports, tagMap.tech],
      organizer: user1.id,
    },
    {
      title: 'Acoustic Open Mic Night',
      description: 'Grab the mic and perform your favorite songs or original pieces in a supportive, no-judgment atmosphere. All skill levels welcome.',
      date: '2026-09-28',
      time: '20:00',
      location: 'The Blue Note Cafe, Nashville',
      capacity: 60,
      isPublic: true,
      tagIds: [tagMap.music, tagMap.art],
      organizer: user2.id,
    },
    {
      title: 'Entrepreneurship 101 Seminar',
      description: 'A practical seminar covering business model canvas, market validation, and fundraising basics. Ideal for aspiring founders with no prior experience.',
      date: '2026-10-15',
      time: '11:00',
      location: 'University Auditorium, Boston',
      capacity: 200,
      isPublic: true,
      tagIds: [tagMap.business, tagMap.education],
      organizer: user1.id,
    },
    {
      title: 'Street Art Walking Tour',
      description: 'Explore the city\'s most iconic murals and graffiti with a local street art historian. The tour covers 3 km and lasts approximately 2 hours.',
      date: '2026-08-15',
      time: '15:00',
      location: 'Shoreditch, London',
      capacity: 15,
      isPublic: true,
      tagIds: [tagMap.art],
      organizer: user2.id,
    },
    {
      title: 'Hackathon: Build for Good',
      description: 'A 24-hour hackathon where teams build tech solutions for non-profit organizations. Mentors, free food, and prizes for top 3 teams.',
      date: '2026-12-06',
      time: '10:00',
      location: 'Co-Working Space, Toronto',
      capacity: 100,
      isPublic: true,
      tagIds: [tagMap.tech, tagMap.business, tagMap.education],
      organizer: user1.id,
    },
  ];

  for (const ev of events) {
    const { organizer, ...dto } = ev;
    const created = await eventsService.create(dto, organizer);
    console.log('Event created:', created.title);
  }

  // user2 joins some of user1's events
  await eventsService.join(1, user2.id); // Tech Conference
  await eventsService.join(3, user2.id); // Design Workshop
  await eventsService.join(9, user2.id); // Data Science Bootcamp

  // user1 joins some of user2's events
  await eventsService.join(2, user1.id); // Community Networking
  await eventsService.join(8, user1.id); // Indie Music Festival

  console.log('Participants added');

  await app.close();
  console.log('Seeding completed!');
}

bootstrap().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
