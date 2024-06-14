import { Body, Controller, HttpException, HttpStatus, Post, Request, Response } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dtos/create-character.dto';

@Controller('characters')
export class CharactersController {
    constructor(private readonly characterService: CharactersService) { }

    @Post()
    async createCharacter(@Body() character: CreateCharacterDto) {
        try {
            return await this.characterService.createCharacter(character);
        } catch (error) {
            console.error(error);
            throw new HttpException('bad request', HttpStatus.BAD_REQUEST);
        }
    }
}
