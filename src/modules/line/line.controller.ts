// src/modules/line/line.controller.ts
import { Controller, Headers, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LineService } from './line.service';

@Controller('webhook/line')
export class LineController {
  constructor(private readonly line: LineService) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-line-signature') signature?: string,
  ) {
    const bodyBuf = req.body as Buffer | undefined;
    try {
      const r = await this.line.handleWebhook(bodyBuf, signature);
      return res.status(r.status).send(r.body);
    } catch (err) {
      console.error('[LINE WEBHOOK ERROR]', err);
      return res.status(500).send('internal error');
    }
  }
}
