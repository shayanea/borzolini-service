import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'boolean', default: false })
  consent!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: 'pending' | 'in_progress' | 'resolved' | 'closed';

  @Column({ type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
