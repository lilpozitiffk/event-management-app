import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, transformer: { to: (value: string) => value?.toLowerCase(), from: (value: string) => value } })
  name: string;

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];
}
