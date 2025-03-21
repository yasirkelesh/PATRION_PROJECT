import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../company/company.entity';

@Entity('Sensors')
export class Sensor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  sensor_id: number;

  @Column()
  device_company: string;

  @ManyToOne(() => Company, company => company.sensors)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn()
  created_at: Date;
}