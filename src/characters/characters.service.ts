import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Character } from './schema/character.schema';
import { Model } from 'mongoose';
import { CreateCharacterDto } from './dtos/create-character.dto';

@Injectable()
export class CharactersService {
    constructor(@InjectModel(Character.name) private characterModel: Model<Character>) { }

    async createCharacter(character: CreateCharacterDto) {
        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };

        //name

        const alignmentRes = await fetch(`https://www.dnd5eapi.co/api/alignments/${character.alignment}`, requestOptions);
        const alignment = await alignmentRes.json();

        //ability

        const raceRes = await fetch(`https://www.dnd5eapi.co/api/races/${character.race}`, requestOptions);
        const race = await raceRes.json();

        const classRes = await fetch(`https://www.dnd5eapi.co/api/classes/${character.class}`, requestOptions);
        const classCharacter = await classRes.json();

        //level

        const featsRes = await fetch(`https://www.dnd5eapi.co/api/feats/${character.feats}`, requestOptions);
        const feats = await featsRes.json();

        //equipament

        //spells


        console.log(classCharacter)
    }
}
