import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm"
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity()
export class User {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => String)
    @Column({ unique:true })
    username!: string;

    //@Field()
    @Column()
    password!: string;

    @Field(()=>String)
    @Column({unique:true})
    email!: string;

}
