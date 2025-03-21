import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,JoinColumn,ManyToOne} from 'typeorm';
import { Role } from '../roles/roles.entity';
import { Company } from '../company/company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ length: 100, unique: true })
  username!: string;

  @Column({ length: 255 })
  password!: string;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role; 

  @ManyToOne(() => Company, company => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}