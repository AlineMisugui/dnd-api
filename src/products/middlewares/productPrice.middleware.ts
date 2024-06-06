import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProductPriceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        body.price = body.price * 1.25
        next();
    }
}
