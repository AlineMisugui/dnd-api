import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/exception-filter/http-exception.filter';
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

    @Get()
    async getCharacters() {
        return await this.characterService.getCharacters();
    }

    @Get(':id')
    async getCharacterById(@Param('id') id: string) {
        return await this.characterService.getCharacterById(id);
    }

    @Delete(':id')
    async deleteCharacter(@Param('id') id: string) {
        return await this.characterService.deleteCharacter(id);
    }

    @Post('random')
    async randomCharacter(@Body() characterName: CharacterNameDto) {
        return await this.characterService.randomCharacter(characterName.name);
    }
}
