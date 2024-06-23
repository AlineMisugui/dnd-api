import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception.filter';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { CharacterNameDto } from './dtos/character-name.dto';

@Controller('characters')
@UseFilters(new HttpExceptionFilter())
export class CharactersController {
    constructor(private readonly characterService: CharactersService) { }
    @Post('create')
    async createCharacter(@Body() character: CreateCharacterDto) {
        return await this.characterService.createCharacter(character);
    }

    @Post('random')
    async randomCharacter(@Body() characterName: CharacterNameDto) {
        return await this.characterService.randomCharacter(characterName.name);
    }
}
