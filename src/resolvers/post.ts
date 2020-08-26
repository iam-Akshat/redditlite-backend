import { Resolver, Query, Ctx } from "type-graphql";
import { Post } from "../entities/Post";
import { DbObjEm } from "../types"
@Resolver()
export class PostResolver{
    @Query(() => [Post])
    posts(@Ctx() {em}: DbObjEm) {   
        return em.find(Post, {});
    }
}