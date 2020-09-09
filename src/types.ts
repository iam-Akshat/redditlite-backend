import { Request, Response } from "express"
import { Redis } from "ioredis";

export type DbObjEm = {
    req:Request;
    res:Response;
    redis:Redis
} 