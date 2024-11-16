import { Response } from 'express';

export class SseController {
  protected async stream<T>(res: Response, iter: AsyncIterable<T>) {
    this.initSSE(res);

    for await (const data of iter) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    res.write('data: DONE\n\n');

    res.end();
  }

  private initSSE(res: Response) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }
}
