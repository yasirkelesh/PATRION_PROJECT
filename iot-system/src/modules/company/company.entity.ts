import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Sensor } from '../sensors/sensors.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Sensor, (sensor) => sensor.company)
  sensors: Sensor[];

  @CreateDateColumn()
  created_at: Date;
}