import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/exception-filter/http-exception.filter';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dtos/create-character.dto';

@Controller('characters')
@UseFilters(new HttpExceptionFilter())
export class CharactersController {
    constructor(private readonly characterService: CharactersService) { }
    @Post('create')
    async createCharacter(@Body() character: CreateCharacterDto) {
        return await this.characterService.createCharacter(character);
    }
}