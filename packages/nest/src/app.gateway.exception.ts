import { WsExceptionFilter } from '@nestjs/common';

export class MinichatWsExceptionFilter implements WsExceptionFilter {
  catch(exception, host) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }
  handleError(client, exception) {
    const status = 'error';
    console.error(exception);
    return client.emit('exception', {
      status: 'error',
      message: exception.message,
    });
  }
}
