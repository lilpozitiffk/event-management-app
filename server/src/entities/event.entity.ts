import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.organizedEvents)
  organizer: User;

  @ManyToMany(() => User, (user) => user.joinedEvents)
  @JoinTable()
  participants: User[];
}
