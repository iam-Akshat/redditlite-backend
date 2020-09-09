import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import env from "./utils/loadEnv"
import path from 'path';
export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    port: 5432,
    password: (env.PSQL_PW as string ),
    entities: [Post, User],  //psql entities/models
    dbName: 'lireddit',
    type: 'postgresql',
    debug: __prod__,

} as const;