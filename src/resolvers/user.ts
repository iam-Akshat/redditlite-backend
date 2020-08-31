import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType } from "type-graphql";
import { User } from '../entities/User'
import { DbObjEm } from "../types"
import argon2 from 'argon2';

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
   @Mutation(()=>UserResponse)
   async register(
       @Arg('options') options: UsernamePassword,
       @Ctx() { req,res,em }: DbObjEm
   ):Promise<UserResponse>{
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, { username: options.username, password: hashedPassword })
    try {
        await em.persistAndFlush(user);
        req.session!.userId = user.id;
        return {
            
            user
        }
    } catch (error) {
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
        errors:[{field:"unknown error",message:"unknown error"}]
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