import { isAuth } from "../middlewares/isAuth";
import { DbObjEm } from "../types";
import { Resolver, Query, Arg, Int, Mutation, InputType, Field, Ctx, UseMiddleware, ObjectType } from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

@InputType()
class PostInput{
    @Field()
    text!:string;

    @Field()
    title!:string;
}
@ObjectType()
class PaginatedPosts{
    @Field(()=>[Post])
    posts: Post[]

    @Field()
    hasMore:boolean
}
@Resolver()
export class PostResolver{
    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit',()=>Int) limit:number,
        @Arg('cursor',()=>String,{nullable:true}) cursor:string |null
    ) :Promise<PaginatedPosts> {   
        const realLimit = Math.min(limit,50);
        const realLimitPlusOne = realLimit+1;
        const args:any=[realLimitPlusOne];
        if(cursor){
            args.push(new Date(parseInt(cursor)))
        }
        const posts = await getConnection().query(
            `SELECT p.*,
            json_build_object(
                'id',u.id,
                'username',u.username
            ) AS creator
            FROM post AS p
            INNER JOIN public.user as u
            ON u.id=p."creatorId"
             ${cursor?'WHERE p."createdAt" <$2':''}
             ORDER BY p."createdAt" DESC 
             LIMIT $1
            `,args
        )
        console.log(posts.slice(0,3));
        
        // const qb = getConnection()
        // .getRepository(Post)
        // .createQueryBuilder("po")
        // .orderBy('"createdAt"',"DESC")
        // .take(realLimitPlusOne);

        // if(cursor){
        //     qb.where('"createdAt" < :cursor',{
        //         cursor:
        //     })
        // }
        // const posts = await qb.getMany()        
        return {
            posts:posts.slice(0, realLimit),
            hasMore:posts.length === realLimitPlusOne
        };
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