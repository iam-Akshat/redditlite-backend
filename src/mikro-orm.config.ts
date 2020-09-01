import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({path:path.join(__dirname, '/.env')});
export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    port: 5432,
    password: (process.env.PSQL_PW as string ),
    entities: [Post, User],  //psql entities/models
    dbName: 'lireddit',
    type: 'postgresql',
    debug: __prod__,

} as const;