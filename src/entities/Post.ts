import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm"
import { ObjectType, Field } from "type-graphql";
import { User } from "./User";
import { Upvote } from "./Upvote";

@ObjectType()
@Entity()
export class Post extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!:string;

    @Field()
    @Column({type:'int',default:0})
    votes!:number

    @Field()
    @Column()
    creatorId!:number

    @Field(()=>User)
    @ManyToOne(()=> User,user =>user.posts)
    creator: User

    @OneToMany(()=>Upvote,(upvote)=>upvote.post)
    upvotes:Upvote[]
  
    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

}
