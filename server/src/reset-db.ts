import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Event],
  synchronize: false,
});

async function resetDatabase() {
  await dataSource.initialize();
  await dataSource.dropDatabase();
  await dataSource.synchronize();
  await dataSource.destroy();
  console.log('Database reset completed');
}

resetDatabase().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
