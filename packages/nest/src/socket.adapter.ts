import { IoAdapter } from '@nestjs/platform-socket.io';
import * as SocketIORedis from 'socket.io-redis';


export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    console.log("add redis adapter")
    const io = super.createIOServer(port, options);
    const redisAdapter = SocketIORedis({ host: 'localhost', port: 6379 });
    io.adapter(redisAdapter);
    return io;
  }
}