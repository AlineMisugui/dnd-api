import { Body, Controller, HttpException, HttpStatus, Post, Request, Response, UseFilters } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception.filter';

@Controller('characters')
@UseFilters(new HttpExceptionFilter())
export class CharactersController {
    constructor(private readonly characterService: CharactersService) { }
    @Post('create')
    async createCharacter(@Body() character: CreateCharacterDto) {
        return await this.characterService.createCharacter(character);
    }
}
