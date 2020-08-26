import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants'
import { Post } from './entities/Post';
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { HelloResolver } from './resolvers/book';
const port = process.env.PORT || 3100
import microConfig from './mikro-orm.config'
const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up()
    
    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[HelloResolver],
            validate: false,
        }),
    });
    
    apolloServer.applyMiddleware({ app });

    app.listen(port, () => {
        console.log(`server started at ${port}`);
    })
}
main().catch(er=>{
    console.error(er);
});