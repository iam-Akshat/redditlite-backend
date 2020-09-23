import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Upvote extends BaseEntity{
    
    @Field()
    @Column({type:'int'})
    value:number

    @Field()
    @PrimaryColumn()
    postId:number
    
    @Field(()=>Post)
    @ManyToOne(()=>Post,(post)=>post.upvotes)
    post:Post

    @Field()
    @PrimaryColumn()
    userId:number

    @Field(()=>User)
    @ManyToOne(()=>User,(user)=>user.upvotes)
    user:User




}

