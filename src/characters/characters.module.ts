import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Character, characterSchema } from './schema/character.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Character.name, schema: characterSchema }]),
  ],
  controllers: [CharactersController],
  providers: [CharactersService]
})
export class CharactersModule { }
