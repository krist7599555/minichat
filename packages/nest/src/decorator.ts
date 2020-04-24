import { createParamDecorator, ExecutionContext, HttpException } from "@nestjs/common";
import { Request } from "express";
import * as cookie from 'cookie';
import { users } from './rethinkdb';

export const Id = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const cooki = request.headers['cookie'] || ''
    const id = cookie.parse(cooki).minichat_id
    if (!id) throw new HttpException("require login", 401);
    if (!await users.get(id).default(null).run()) throw new HttpException("id is not exist", 401)
    return id
  },
);