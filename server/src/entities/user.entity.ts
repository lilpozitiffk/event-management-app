import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  @ManyToMany(() => Event, (event) => event.participants)
  joinedEvents: Event[];
}
