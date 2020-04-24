import { Injectable, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { users } from './rethinkdb';
import { User } from './interface';
import { r } from 'rethinkdb-ts'
import { AppGateway } from './app.gateway';

@Injectable()
export class AuthService {
  constructor(private gateway: AppGateway) {}
  async register({username, password}, res: Response) {
    if (!username) throw new BadRequestException("username is required")
    if (!password) throw new BadRequestException("password is required")
    
    let usr: User = await users.filter({ username }).nth(0).run().catch(e => null)
    if (usr && usr.password != password) {
      throw new BadRequestException("username or password is wrong");
    }
    if (!usr) {
      const wr = await users.insert(
        { 
          username, 
          password, 
          display_name: username, 
          rooms: {}, 
          create_time: r.now() 
        }, 
        { returnChanges: true }
      ).run()
      usr = wr.changes[0].new_val;
      res.cookie('minichat_id', usr.id);
      res.status(201).send({ message: "register success" })
    } else {
      res.cookie('minichat_id', usr.id);
      res.status(200).send({ message: "login success" })
    } 
  }
  logout(id: string, res: Response) {
    try {
      this.gateway.client(id).disconnect()
    } catch {
      
    }
    res.clearCookie('minichat_id')
    res.clearCookie('io')
    res.status(200).send({ message: "logout success" })
  }
  profile(userid: string) {
    return users.get(userid).pluck('id', 'username', 'display_name').run()
  }
}
