import { isAuth } from "../middlewares/isAuth";
import { DbObjEm } from "../types";
import { Resolver, Query, Arg, Int, Mutation, InputType, Field, Ctx, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class PostInput{
    @Field()
    text!:string;

    @Field()
    title!:string;
}

@Resolver()
export class PostResolver{
    @Query(() => [Post])
    async posts() :Promise<Post[]> {   
        return  Post.find()
    }

    @Query(() => Post, { nullable:true })
    post(
        @Arg('id',() => Int) id: number,
        ) : Promise<Post | undefined> {   
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('postInput',() => PostInput) postInput:PostInput,
        @Ctx() {req} : DbObjEm
    ) : Promise<Post> {
        const newPost = Post.create({
            ...postInput,
            creatorId:req.session!.userId
        }).save();
        return newPost
    }

    @Mutation(() => Post ,{ nullable:true })
    async updatePost(
        @Arg('id') id:number,
        @Arg('title',() => String, { nullable: true }) title:string,
    ) : Promise<Post | null> {
        const post = await Post.findOne(id)
        if(!post){
            return null;
        }
        if(typeof title !== undefined){
            post.title = title;
            await post.save()
        }
        return post;
    }

    @Mutation(() => Boolean )
    async deletePost(
        @Arg('id') id:number,
    ) : Promise<boolean>{
        await Post.delete(id)
        return true;
    }
}