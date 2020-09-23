import "reflect-metadata"
import { createConnection } from "typeorm";
import { __prod__ } from './constants'
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import cors from 'cors';
const port = process.env.PORT || 3100
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { DbObjEm } from './types'
import env from "./utils/loadEnv";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
import { Upvote } from "./entities/Upvote";


const RedisStore = connectRedis(session)
const redis = new  Redis({})
const main = async () => {

    const conn = await createConnection({
        type:'postgres',
        username:'postgres',
        database:'lireddit2',
        port:5432,
        password:env.PSQL_PW,
        entities:[User,Post,Upvote],
        migrations:[path.join(__dirname,"./migrations/*")],
        logging:true,
        synchronize:true,
    })
    await conn.runMigrations()
    const app = express(); 
    app.use(cors({
        origin:'http://localhost:3000',
        credentials:true
    }))
    app.use(
        session({
          name: 'qid',
          store: new RedisStore({ client: redis, disableTouch:true }),
          cookie:{
              maxAge: 1000*60*60*24,
              httpOnly: true,
              secure: false ,//uses https only,
              sameSite: "lax"
          },
          saveUninitialized:false,
          secret: env.COOKIE_SECRET,
          resave: false,
        })
      )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[PostResolver, UserResolver],
            validate: false,
        }),
        context:({req,res}):DbObjEm => ({ req, res,redis })
    });
    
    apolloServer.applyMiddleware({ app,cors:false });

    app.listen(port, () => {
        console.log(`server started at ${port}`);
    })
}
main().catch(er=>{
    console.error(er);
});
