import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { ObjectType, Field } from "type-graphql";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ unique:true })
    username!: string;

    //@Field()                  //bad
    @Column()
    password!: string;

    @Field(()=>String)
    @Column({unique:true})
    email!: string;

    @Field(()=>[Post],{nullable:true})
    @OneToMany(()=>Post,(post)=>post.creator)
    posts:Post[]

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

}
