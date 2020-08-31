import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from "type-graphql";
import { User } from '../entities/User'
import { DbObjEm } from "../types"
import argon2 from 'argon2';
import { EntityManager } from "@mikro-orm/postgresql";
@InputType()
class UsernamePassword{
    @Field()
    username!: string;

    @Field()
    password!: string;
}
@ObjectType()
class FieldError{
    @Field() 
    field:string;

    @Field()
    message:string;

}
@ObjectType()
class UserResponse{
    @Field(()=>[FieldError],{nullable:true})
    errors?:FieldError[];

    @Field(()=> User,{nullable:true})
    user?:User;

}
@Resolver()
export class UserResolver{
    @Query(()=>User,{nullable:true})
    async me(
        @Ctx() { req,res,em }: DbObjEm
    ){
        if(!(req.session!.userId)) return null;
        const user = em.findOne(User,{id:req.session!.userId})
        return user;
    }

   @Mutation(()=>UserResponse)
   async register(
       @Arg('options') options: UsernamePassword,
       @Ctx() { req,res,em }: DbObjEm
   ):Promise<UserResponse>{
    const hashedPassword = await argon2.hash(options.password)
    try {
        const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
            username:options.username,
            password: hashedPassword,
            created_at: new Date(),
            updated_at:new Date()
        }).returning('*');
        const user = result[0]
        req.session!.userId= user.id;
        return {
            user
        }
    } catch (error) {
        //console.log(error);
        if(error.code=="23505"){
            return {
                errors:[{
                    field:'username',
                    message:'user already exists'
                }]
            }
        }
    }
    
    return {
        errors:[{field:"username",message:"unknown error"}]
    }
   }

   @Mutation(()=>UserResponse)
   async login(
       @Arg('options') options: UsernamePassword,
       @Ctx() { em, req}: DbObjEm
   ):Promise<UserResponse>{
    const user = await em.findOne(User, { username: options.username })

    if(!user){
        return {
            errors:[
                {
                    field:'username',
                    message:'username not found'
                }
            ]
        }
    }
    const validP = await argon2.verify(user.password,options.password)
    if(!validP){
        return {
            errors:[
                {
                    field:'password',
                    message:'wrong password'
                }
            ]
        }
    }
    console.log(req.session);
    //const user = em.create(User, { username: options.username, password: hashedPassword })
    if(req.session){
        req.session.userId=user.id
    }
    
    
    return {
        user:user
    };
   }
}