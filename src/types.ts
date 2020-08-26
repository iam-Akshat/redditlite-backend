import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";


export type DbObjEm{
    em: EntityManager<IDatabaseDriver<Connection>>
}