import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from "type-graphql";
import { User } from '../entities/User'
import { DbObjEm } from "../types"
import argon2 from 'argon2';
import sendEmail from "../utils/sendEmail";
import { v4 } from "uuid";
import { validateUsername, validatePassword, validateRegisterCred, validateEmail } from "../utils/validator";
import env from "../utils/loadEnv"
import { getConnection } from "typeorm";
@InputType()
class UsernamePasswordAndOrEmail {
    @Field()
    username!: string;

    @Field()
    password!: string;

    @Field(() => String, { nullable: true })
    email?: string;
}
@ObjectType()
export class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;

}
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;

}
@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: DbObjEm
    ) {
        if (!(req.session!.userId)) return null;
        const user = User.findOne(req.session!.userId)
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordAndOrEmail,
        @Ctx() { req }: DbObjEm
    ): Promise<UserResponse> {
        const validationErrors = validateRegisterCred(options.email as string, options.password, options.username)
        if (validationErrors) return {
            errors: validationErrors
        }
        const hashedPassword = await argon2.hash(options.password)
        try {
           const result = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                email: options.email,
                username: options.username,
                password: hashedPassword,
            }).returning('*').execute()
            const user = result.raw[0]
            req.session!.userId = user.id;
            return {
                user
            }
        } catch (error) {
            //console.log(error);
            if (error.code == "23505") {
                return {
                    errors: [{
                        field: 'username',
                        message: 'user already exists'
                    }]
                }
            }
        }

        return {
            errors: [{ field: "username", message: "unknown error" }]
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordAndOrEmail,
        @Ctx() { req }: DbObjEm
    ): Promise<UserResponse> {
        if (validateUsername(options.username) || validatePassword(options.password)) return {
            errors: [
                {
                    field: 'username',
                    message: 'Wrong username or password'
                }
            ]
        }
        const user = await User.findOne( { where: { username: options.username } })

        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'username not found'
                    }
                ]
            }
        }
        const validP = await argon2.verify(user.password, options.password)

        if (!validP) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'wrong password'
                    }
                ]
            }
        }
        //const user = em.create(User, { username: options.username, password: hashedPassword })
        if (req.session) {
            req.session.userId = user.id
        }
        return {
            user: user
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: DbObjEm
    ) {
        return new Promise(resolve => {
            res.clearCookie('qid');
            req.session?.destroy((err) => {
                if (err) {
                    console.log(err);
                    resolve(false)
                    return
                }
                resolve(true)
            })
        })
    }
    @Mutation(() => Boolean)
    async forgotPassword(
        @Ctx() { redis }: DbObjEm,
        @Arg('email') email: string
    ): Promise<Boolean> {
        const valErr = validateEmail(email)
        if (valErr) return false;
        const person = await User.findOne( {where: email })
        if (person) {
            const token = v4();
            await redis.set(env.RESET_TOKEN_PREFIX + token, person.id, 'ex', 1000 * 60 * 60 * 24)
            const linkMarkup = `<a href="http://localhost:3000/change-password/${token}" target="_blank">Reset Password</a>`
            sendEmail(person.email, person.username, linkMarkup)
            return true;
        } else {
            return true;
        }
    }
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassw') newPassw: string,
        @Ctx() { redis }: DbObjEm
    ): Promise<UserResponse> {
        const userId = await redis.get(env.RESET_TOKEN_PREFIX + token)

        if (!(userId)) {
            return {
                errors: [
                    { field: "password", message: "Invalid link" }
                ]
            }
        }
        const person = await User.findOne(+userId)


        const validPassw = validatePassword(newPassw)
        console.log(validPassw);

        if (validPassw) {
            return {
                errors: [
                    { field: "password", message: `${validPassw}` }
                ]
            }
        }
        const hashedPassword = await argon2.hash(newPassw)
        person!.password = hashedPassword;
        (person as User).save()

        redis.del(env.RESET_TOKEN_PREFIX + token)
        return {
            user: person as User
        }


    }
}
