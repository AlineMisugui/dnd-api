import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { abilityScores } from './ability-scores/ability-scores';
import { EquipmentChoice } from './class/equipment-choice.class';
import { Equipment } from './class/equipment.class';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { mainModifiers } from './main-modifiers/main-modifiers';
import { Character } from './schema/character.schema';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import { alignments } from './alignments/alignments';
import { AbilityScoreDto } from './dtos/ability-score.dto';
import { races } from './races/races';
import { characterClass } from './character-class/character-class';
import { EquipamentDto } from './dtos/equipament.dto';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { ConflictException } from '../common/exceptions/conflict.exception';
const fs = require('fs');

@Injectable()
export class CharactersService {
    constructor(@InjectModel(Character.name) private characterModel: Model<Character>) { }

    private BASE_URL_DND5E = 'https://www.dnd5eapi.co/api';

    private getRequestOptions(): { method: string; headers: Headers } {
        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        return {
            method: "GET",
            headers: myHeaders
        };
    }

    private async fetchAndValidateCharacterData(character: CreateCharacterDto) {
        const requestOptions = this.getRequestOptions();
        const [alignmentRes, raceRes, classRes, featsJSON, spellsRes] = await Promise.all([
            fetch(`${this.BASE_URL_DND5E}/alignments/${character.alignment}`, requestOptions),
            fetch(`${this.BASE_URL_DND5E}/races/${character.race}`, requestOptions),
            fetch(`${this.BASE_URL_DND5E}/classes/${character.class}`, requestOptions),
            fs.readFileSync('./src/characters/feats.json', 'utf8'),
            fetch(`${this.BASE_URL_DND5E}/classes/${character.class}/spells`, requestOptions)
        ])
    
        const [alignment, race, classCharacter, feats, spells] = await Promise.all([
            alignmentRes.json(),
            raceRes.json(),
            classRes.json(),
            JSON.parse(featsJSON),
            spellsRes.json()
        ])
        this.validateResponseStatus(alignmentRes, 'Character alignment is invalid');
        this.validateResponseStatus(raceRes, 'Character race is invalid');
        this.validateResponseStatus(classRes, 'Character class is invalid');
    
        return { alignment, race, classCharacter, feats, spells };
    }

    async createCharacter(character: CreateCharacterDto) {
        try {
            const exists = await this.characterModel.findOne({ name: character.name });
            if (exists) {
                throw new ConflictException(`Character ${character.name} already exists`);
            }
            const { classCharacter, feats, spells } = await this.fetchAndValidateCharacterData(character);

            if (character.feats !== undefined) {
                const abilityScoreImprovements = Math.floor((character.level === 19 ? 20 : character.level) / 4);
                let remainingAbilityScoreImprovements = abilityScoreImprovements;
                if (character.feats.length >= 6 || character.feats.length > remainingAbilityScoreImprovements) {
                    throw new BadRequestException( 'Number of feats exceeded for the level');
                }
        
                remainingAbilityScoreImprovements = remainingAbilityScoreImprovements - character.feats.length;
                for (let feat of character.feats) {
                    if (feats.Feats.findIndex((el: any) => { return el.index == feat }) === -1) {
                        return new BadRequestException(`The feat ${feat} is invalid to this version`);
                    }
                }
            }

            let equipmentChoices = new Array<EquipmentChoice>;
            equipmentChoices = this.processEquipments(classCharacter, equipmentChoices, character);
            this.validateEquipments(character, equipmentChoices);
            this.validateAbilities(character, abilityScores);
            this.validateSpells(character, spells);

            return await this.characterModel.create(character);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private processEquipments(
        classCharacter, 
        equipmentChoices: EquipmentChoice[], 
        character: CreateCharacterDto
    ) {
        let startEquipments = new Array<Equipment>;
        for (let equipment of classCharacter.starting_equipment_options) {
            if (equipment.from.option_set_type == 'equipment_category') {
                const choice = equipment;
                const choices = new EquipmentChoice();
                choices.choices.push(new Equipment(choice.from.equipment_category.index, '', choice.choose));
                equipmentChoices.push(choices);
            } else if (equipment.from.option_set_type == 'options_array') {
                equipmentChoices = this.processEquipmentOption(equipment, equipmentChoices);
            }
        }

        for (let start of classCharacter.starting_equipment) {
            const equipment = new Equipment(start.equipment.index, '', start.quantity)
            startEquipments.push(equipment);
        }

        let foundStartEquipment = new Array();
        for (let equipment of character.equipament) {
            if (equipment.length === 1) {
                const equipmentItem = equipment[0];
                const equipmentIndex = startEquipments.findIndex((el) => { return el.index === equipmentItem.name });
                if (equipmentIndex !== -1) {
                    if (startEquipments[equipmentIndex].count == equipmentItem.amount) {
                        foundStartEquipment.push(true);
                    }
                }
            }
        }

        if (foundStartEquipment.length !== startEquipments.length) {
            throw new BadRequestException('Invalid standard equipment(s)');
        }
        const startEquipmentChoice = new EquipmentChoice();
        startEquipmentChoice.choices = startEquipments;
        if (startEquipmentChoice.choices.length > 0) {
            equipmentChoices = equipmentChoices.concat(startEquipmentChoice);
        }

        let maxItens = classCharacter.starting_equipment_options.length + startEquipments.length;
        if (character.equipament.length !== maxItens) {
            throw new BadRequestException('Number of equipments is invalid');
        }

        return equipmentChoices;
    }

    private validateEquipments(character: CreateCharacterDto, equipmentChoices: EquipmentChoice[]) {
        for (let item of character.equipament) {
            let validatedEquipments = new Array<Number>;
            for (let [index, startEquipment] of equipmentChoices.entries()) {
                for (let elItem of startEquipment.choices) {
                    const index = item.findIndex((el) => { return el.name === elItem.index && el.amount === elItem.count });
                    if (index !== -1) {
                        if (!validatedEquipments.includes(index)) {
                            validatedEquipments.push(index);
                            if (item[index].amount !== elItem.count) {
                                throw new BadRequestException(`Item ${item[index].name} with invalid initial quantity`);
                            }
                        }
                    }
                }
            }

            if (validatedEquipments.length != item.length) {
                throw new BadRequestException(`One or more pieces of equipment are invalid for the class: ${character.class}`);
            }
        }
    }

    private validateSpells(character: CreateCharacterDto, spells: any) {
        if (spells.count == 0) {
            if (character.spells != undefined) {
                throw new BadRequestException(`The class ${character.class} has no spells`);
            }
        } else {
            const modifier = mainModifiers[character.class];
            const modify = character.abilityScore.find((el) => { return el.index == modifier });
            let spellsAmount = (modify.value - 10) != 0 ? Math.floor((modify.value - 10) / 2) : 0;
            spellsAmount += character.level;

            if (spellsAmount < character.spells.length) {
                throw new BadRequestException(`The class ${character.class} has more spells than it should. Expected ${spellsAmount} and found ${character.spells.length}`);
            } else if (spellsAmount > character.spells.length) {
                throw new BadRequestException(`The class ${character.class} has less spells than it should. Expected ${spellsAmount} and found ${character.spells.length}`);
            }

            for (let spellItem of character.spells) {
                const index = spells.results.findIndex((el: any) => {
                    return el.index === spellItem;
                })

                if (spells.results[index].level > character.level) {
                    throw new BadRequestException(`The class ${character.class} of level ${character.level} can't have the spell ${spells.results[index].index} of level ${spells.results[index].level}`)
                }
            }
        }
    }

    private validateAbilities(character: CreateCharacterDto, abilityScores: string[]) {
        let characterAbilityCopy = [...character.abilityScore];

        if (characterAbilityCopy.length !== abilityScores.length) {
            throw new BadRequestException('Invalid abilities');
        }

        for (let i = 0; i < abilityScores.length; i++) {
            if (characterAbilityCopy[0] === undefined) {
                throw new BadRequestException('Invalid abilities');
            }

            if (abilityScores.findIndex((el) => { return el === characterAbilityCopy[0].index }) === -1) {
                throw new BadRequestException('Invalid abilities');
            }

            if (characterAbilityCopy[0].value > 20 || characterAbilityCopy[0].value < 8) {
                throw new BadRequestException('Invalid ability value');
            }

            characterAbilityCopy.shift();
        }
    }

    private processEquipmentOption(equipment, equipmentChoices) {
        for (let option of equipment.from.options) {
            const typeOptions = {
                'multiple': (option) => {
                    const choices = new EquipmentChoice();
                    for (let choice of option.items) {
                        if (choice.option_type == 'choice') {
                            choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choice.choose));
                        } else if (choice.option_type == 'counted_reference') {
                            choices.choices.push(new Equipment(choice.of.index, '', choice.count));
                        }
                    }
                    equipmentChoices.push(choices);
                },
                'choice': (option) => {
                    const choice = option;
                    const choices = new EquipmentChoice();
                    choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choice.choose));
                    equipmentChoices.push(choices);
                },
                'counted_reference': (option) => {
                    const choice = option;
                    const choices = new EquipmentChoice();
                    choices.choices.push(new Equipment(choice.of.index, '', choice.count));
                    equipmentChoices.push(choices);
                }
            }

            if (typeOptions[option.option_type] !== undefined) {
                typeOptions[option.option_type](option);
            }
        }
        return equipmentChoices;
    }

    private validateResponseStatus(response: any, errorMessage: string) {
        if (response.status !== 200) {
            throw new BadRequestException(errorMessage);
        }
    }

    async randomCharacter(name: string) {
        try {
            const exists = await this.characterModel.findOne({ name: name });
            if (exists) {
                throw new ConflictException(`Character ${name} already exists`);
            }

            const requestOptions = this.getRequestOptions();

            const character = new CreateCharacterDto();
            character.name = name;
            character.alignment = alignments[Math.floor(Math.random() * alignments.length)];
            character.abilityScore = new Array<AbilityScoreDto>();
            for (let ability of abilityScores) {
                const item = new AbilityScoreDto();
                item.index = ability;
                item.value = Math.floor((Math.random() * 13) + 8)

                character.abilityScore.push(item);
            }

            character.race = races[Math.floor(Math.random() * races.length)];
            character.class = characterClass[Math.floor(Math.random() * characterClass.length)];
            character.level = Math.floor((Math.random() * 20) + 1)

            const featsRes = await fs.readFileSync('./src/characters/feats.json', 'utf8');
            const feats = await JSON.parse(featsRes);
            const featsImprovements = Math.floor((character.level === 19 ? 20 / 4 : character.level) / 4);
            character.feats = new Array<string>();
            for (let i = 0; i < featsImprovements; i++) {
                const random = Math.floor(Math.random() * feats.Feats.length)
                character.feats.push(feats.Feats[random].index);
                feats.Feats.slice(random, 1);
            }

            let equipmentChoices = new Array<EquipmentChoice[]>;

            const classRes = await fetch(`${this.BASE_URL_DND5E}/classes/${character.class}`, requestOptions);
            const classCharacter = await classRes.json();

            for (let [index, equipment] of classCharacter.starting_equipment_options.entries()) {
                if (equipment.from.option_set_type == 'equipment_category') {
                    const choice = equipment;
                    const choices = new EquipmentChoice();
                    choices.choices.push(new Equipment(choice.from.equipment_category.index, '', choice.choose));
                    equipmentChoices[index] = new Array<EquipmentChoice>();
                    equipmentChoices[index].push(choices);
                } else if (equipment.from.option_set_type == 'options_array') {
                    let i = 0;
                    for (let option of equipment.from.options) {
                        if (option.option_type == 'multiple') {
                            const choices = new EquipmentChoice();
                            for (let choice of option.items) {
                                if (choice.option_type == 'choice') {
                                    choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choice.choose));
                                } else if (choice.option_type == 'counted_reference') {
                                    choices.choices.push(new Equipment(choice.of.index, '', choice.count));
                                }
                            }
                            if (equipmentChoices[index] === undefined) {
                                equipmentChoices[index] = new Array<EquipmentChoice>();
                            }
                            equipmentChoices[index].push(choices);
                        } else if (option.option_type == 'choice') {
                            const choice = option;
                            const choices = new EquipmentChoice();
                            choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choice.choose));
                            if (equipmentChoices[index] === undefined) {
                                equipmentChoices[index] = new Array<EquipmentChoice>();
                            }
                            equipmentChoices[index].push(choices);
                        } else if (option.option_type == 'counted_reference') {
                            const choice = option;
                            const choices = new EquipmentChoice();
                            choices.choices.push(new Equipment(choice.of.index, '', choice.count));
                            if (equipmentChoices[index] === undefined) {
                                equipmentChoices[index] = new Array<EquipmentChoice>();
                            }
                            equipmentChoices[index].push(choices);
                        }
                    }
                }
            }

            if (classCharacter.starting_equipment.length > 0) {
                for (let start of classCharacter.starting_equipment) {
                    const equipment = new Equipment(start.equipment.index, '', start.quantity)
                    const choice = new EquipmentChoice();
                    choice.choices.push(equipment);
                    const item = new Array<EquipmentChoice>();
                    item.push(choice)
                    equipmentChoices.push(item)
                }
            }

            character.equipament = new Array<EquipamentDto[]>();
            for (let [index, choice] of equipmentChoices.entries()) {
                if (choice.length > 1) {
                    const random = Math.floor(Math.random() * choice.length);
                    const equipments = new Array<EquipamentDto>;
                    for (let item of choice[random].choices) {
                        const equip = new EquipamentDto()
                        equip.amount = item.count;
                        equip.name = item.index;
                        equipments.push(equip);
                    }
                    character.equipament.push(equipments);
                } else {
                    for (let item of choice[0].choices) {
                        const equipments = new Array<EquipamentDto>;
                        const equip = new EquipamentDto()
                        equip.amount = item.count;
                        equip.name = item.index;
                        equipments.push(equip)
                        character.equipament.push(equipments);
                    }
                }
            }

            const spellsRes = await fetch(`${this.BASE_URL_DND5E}/classes/${character.class}/spells`, requestOptions);
            const spells = await spellsRes.json();

            if (spells.count !== 0) {
                const modifier = mainModifiers[character.class];
                const modify = character.abilityScore.find((el) => { return el.index == modifier });
                let spellsAmount = (modify.value - 10) != 0 ? Math.floor((modify.value - 10) / 2) : 0;
                spellsAmount += character.level;

                const validSpells = spells.results.filter((el: any) => {
                    return el.level <= character.level
                })

                character.spells = new Array<string>();
                for (let i = 0; i < spellsAmount; i++) {
                    const random = Math.floor(Math.random() * validSpells.length);
                    character.spells.push(validSpells[random].index);
                    validSpells.slice(random, 1);
                }
            }


            return await this.createCharacter(character);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCharacters() {
        return await this.characterModel.find();
    }

    async getCharacterById(id: string) {
        const character = await this.characterModel.findOne({ _id: id });
        if (!character) {
            throw new NotFoundException('Character not found');
        }
        return character;
    }

    async deleteCharacter(id: string) {
        await this.getCharacterById(id);
        return await this.characterModel.deleteOne({ _id: id });
    }
}
