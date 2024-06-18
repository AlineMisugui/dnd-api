import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Character } from './schema/character.schema';
import { Model } from 'mongoose';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { Equipment } from './class/equipment.class';
import { EquipmentChoice } from './class/equipment-choice.class';

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

        const name = character.name;

        const level = character.level;

        const alignmentRes = await fetch(`https://www.dnd5eapi.co/api/alignments/${character.alignment}`, requestOptions);
        const alignment = await alignmentRes.json();

        //ability

        const raceRes = await fetch(`https://www.dnd5eapi.co/api/races/${character.race}`, requestOptions);
        const race = await raceRes.json();

        const classRes = await fetch(`https://www.dnd5eapi.co/api/classes/${character.class}`, requestOptions);
        const classCharacter = await classRes.json();

        const featsRes = await fetch(`https://www.dnd5eapi.co/api/feats/${character.feats}`, requestOptions);
        const feats = await featsRes.json();

        //equipament

        //spells

        const equipmentChoices = new Array<EquipmentChoice>;

        if (classRes.status === 200) {
            for (let equipment of classCharacter.starting_equipment_options) {
                if (equipment.from.option_set_type == 'equipment_category') {
                    const choice = equipment.from;
                    const choices = new EquipmentChoice();
                    choices.choices.push(new Equipment(choice.equipment_category.index, '', choice.choose));
                    equipmentChoices.push(choices);
                } else if (equipment.from.option_set_type == 'options_array') {
                    for (let option of equipment.from.options) {
                        if (option.option_type == 'multiple') {
                            const choices = new EquipmentChoice();
                            for (let choice of option.items) {
                                if (choice.option_type == 'choice') {
                                    choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choice.choose));
                                } else if (choice.option_type == 'counted_reference') {
                                    choices.choices.push(new Equipment(choice.of.index, '', choice.count))
                                }
                            }
                            equipmentChoices.push(choices);
                        } else if (option.option_type == 'choice') {
                            const choice = option;
                            const choices = new EquipmentChoice();
                            choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choose));
                            equipmentChoices.push(choices);
                        } else if (option.option_type == 'counted_reference') {
                            const choice = option;
                            const choices = new EquipmentChoice();
                            choices.choices.push(new Equipment(choice.of.index, '', choice.count));
                            equipmentChoices.push(choices);
                        }
                    }
                }
            }
        }

        console.log(equipmentChoices)




    }
}
