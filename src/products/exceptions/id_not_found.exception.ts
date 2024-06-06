import { HttpException, HttpStatus } from "@nestjs/common"

export class IdNotFoundException extends HttpException {
    constructor() {
        super('Id not found', HttpStatus.NOT_FOUND);
    }
} 