import { __prod__ } from './constants';
import { Post } from './entities/Post';
import path from 'path';
import { User } from './entities/User';
export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    port: 5432,
    password: 'mahanakshat',
    entities: [Post, User],
    dbName: 'lireddit',
    type: 'postgresql',
    debug: __prod__,

} as const;