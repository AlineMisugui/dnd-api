import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { abilityScores } from './ability-scores/ability-scores';
import { EquipmentChoice } from './class/equipment-choice.class';
import { Equipment } from './class/equipment.class';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { mainModifiers } from './main-modifiers/main-modifiers';
import { Character } from './schema/character.schema';
const fs = require('fs');

@Injectable()
export class CharactersService {
    constructor(@InjectModel(Character.name) private characterModel: Model<Character>) { }

    async createCharacter(character: CreateCharacterDto) {
        try {
            const exists = await this.characterModel.findOne({ name: character.name });

            if (exists) {
                throw new HttpException(`Personagem ${character.name} já existe`, HttpStatus.BAD_REQUEST);
            }

            const myHeaders = new Headers();
            myHeaders.append("Accept", "application/json");

            const requestOptions = {
                method: "GET",
                headers: myHeaders
            };

            const [alignmentRes, raceRes, classRes, featsJSON, spellsRes] = await Promise.all([
                fetch(`https://www.dnd5eapi.co/api/alignments/${character.alignment}`, requestOptions),
                fetch(`https://www.dnd5eapi.co/api/races/${character.race}`, requestOptions),
                fetch(`https://www.dnd5eapi.co/api/classes/${character.class}`, requestOptions),
                fs.readFileSync('./src/characters/feats.json', 'utf8'),
                fetch(`https://www.dnd5eapi.co/api/classes/${character.class}/spells`, requestOptions)
            ])

            const [alignment, race, classCharacter, feats, spells] = await Promise.all([
                alignmentRes.json(),
                raceRes.json(),
                classRes.json(),
                JSON.parse(featsJSON),
                spellsRes.json()
            ])

            const abilityScoreImprovements = Math.floor(character.level === 19 ? 20 : character.level / 4);
            let remaingAbilityScoreImprovements = abilityScoreImprovements;


            if (character.feats !== undefined) {
                if (character.feats.length < 6 && character.feats.length <= remaingAbilityScoreImprovements) {
                    remaingAbilityScoreImprovements = remaingAbilityScoreImprovements - character.feats.length;
                    for (let feat of character.feats) {
                        if (feats.Feats.findIndex((el: any) => { return el.index == feat }) === -1) {
                            return new HttpException(`A feat ${feat} é inválida para esta versão`, HttpStatus.BAD_REQUEST);
                        }
                    }
                } else {
                    throw new HttpException('Número de feats excedido para o level', HttpStatus.BAD_REQUEST)
                }
            }


            let equipmentChoices = new Array<EquipmentChoice>;
            let startEquipments = new Array<Equipment>;

            if (alignmentRes.status !== 200) {
                throw new HttpException('Alignment do personagem está inválido', HttpStatus.BAD_REQUEST);
            }

            if (raceRes.status !== 200) {
                throw new HttpException('Raça do personagem inválida', HttpStatus.BAD_REQUEST);

            }

            if (classRes.status !== 200) {
                throw new HttpException('Classe de personagem inválida', HttpStatus.BAD_REQUEST);
            }

            if (classRes.status === 200) {
                for (let equipment of classCharacter.starting_equipment_options) {
                    if (equipment.from.option_set_type == 'equipment_category') {
                        const choice = equipment;
                        const choices = new EquipmentChoice();
                        choices.choices.push(new Equipment(choice.from.equipment_category.index, '', choice.choose));
                        equipmentChoices.push(choices);
                    } else if (equipment.from.option_set_type == 'options_array') {
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
                                equipmentChoices.push(choices);
                            } else if (option.option_type == 'choice') {
                                const choice = option;
                                const choices = new EquipmentChoice();
                                choices.choices.push(new Equipment(choice.choice.from.equipment_category.index, '', choice.choice.choose));
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

                for (let start of classCharacter.starting_equipment) {
                    const equipment = new Equipment(start.equipment.index, '', start.quantity)
                    startEquipments.push(equipment);
                }
            }

            let foundStartEquipment = new Array();
            for (let equipment of character.equipament) {
                if (equipment.length === 1) {
                    const equipmentItem = equipment[0];
                    const equipmentIndex = startEquipments.findIndex((el) => { return el.index === equipmentItem.name });
                    if (equipmentIndex !== -1) {
                        console.log(true)
                        if (startEquipments[equipmentIndex].count == equipmentItem.amount) {
                            foundStartEquipment.push(true);
                        }
                    }
                }
            }

            if (foundStartEquipment.length === startEquipments.length) {
                console.log('equipamento padrão validado');
            } else {
                console.log('Não tem equipamento padrão');
                throw new HttpException('Equipamento(s) padrão(ões) inválido(s)', HttpStatus.BAD_REQUEST);
            }

            const startEquipmentChoice = new EquipmentChoice();
            startEquipmentChoice.choices = startEquipments;
            equipmentChoices = equipmentChoices.concat(startEquipmentChoice);
            let maxItens = classCharacter.starting_equipment_options.length + startEquipments.length;
            if (character.equipament.length === maxItens) {
                for (let item of character.equipament) {
                    let validatedEquipments = new Array<Number>;
                    for (let [index, startEquipment] of equipmentChoices.entries()) {
                        for (let elItem of startEquipment.choices) {
                            const index = item.findIndex((el) => { return el.name === elItem.index });
                            if (index !== -1) {
                                if (!validatedEquipments.includes(index)) {
                                    validatedEquipments.push(index);
                                    if (item[index].amount !== elItem.count) {
                                        console.log('entrou aqui')
                                        throw new HttpException(`Item ${item[index].name} com quantidade inicial inválida`, HttpStatus.BAD_REQUEST);
                                    }
                                }
                            }
                        }

                    }

                    if (validatedEquipments.length != item.length) {
                        throw new HttpException(`Um ou mais equipamentos são inválidos para a classe ${character.class}`, HttpStatus.BAD_REQUEST);
                    }
                }
            } else {
                throw new HttpException('Quantidade de equipamentos inválidos', HttpStatus.BAD_REQUEST);
            }

            let characterAbilityCopy = [...character.abilityScore];

            if (characterAbilityCopy.length !== abilityScores.length) {
                throw new HttpException('Habilidades inválidas', HttpStatus.BAD_REQUEST);
            }

            for (let i = 0; i < abilityScores.length; i++) {
                if (characterAbilityCopy[0] === undefined) {
                    throw new HttpException('Habilidades inválidas', HttpStatus.BAD_REQUEST);
                }

                if (abilityScores.findIndex((el) => { return el === characterAbilityCopy[0].index }) === -1) {
                    throw new HttpException('Habilidades inválidas', HttpStatus.BAD_REQUEST);
                }

                if (characterAbilityCopy[0].value > 20 || characterAbilityCopy[0].value < 8) {
                    throw new HttpException('Valor de habilidade inválido', HttpStatus.BAD_REQUEST)
                }

                characterAbilityCopy.shift();
            }

            if (spells.count == 0) {
                if (character.spells.length != 0 || character.spells !== null || character.spells !== undefined) {
                    throw new HttpException(`A classe ${character.class} não tem magias`, HttpStatus.BAD_REQUEST);
                }
            } else {
                const modifier = mainModifiers[character.class];
                const modify = character.abilityScore.find((el) => { return el.index == modifier });
                let spellsAmount = (modify.value - 10) != 0 ? Math.floor((modify.value - 10) / 2) : 0;
                spellsAmount += character.level;

                if (spellsAmount < character.spells.length) {
                    throw new HttpException(`A classe ${character.class} possui mais magias do que deveria. esperava ${spellsAmount} e encontrou ${character.spells.length}`, HttpStatus.BAD_REQUEST);
                } else if (spellsAmount > character.spells.length) {
                    throw new HttpException(`A classe ${character.class} possui menos magias do que deveria. esperava ${spellsAmount} e encontrou ${character.spells.length}`, HttpStatus.BAD_REQUEST);
                }

                for (let spellItem of character.spells) {

                    const index = spells.results.findIndex((el: any) => {
                        return el.index === spellItem;
                    })

                    if (spells.results[index].level > character.level) {
                        throw new HttpException(`A classe ${character.class} de nível ${character.level} não pode ter a magia ${spells.results[index].index} de nível ${spells.results[index].level}`, HttpStatus.BAD_REQUEST)
                    }
                }
            }

            return await this.characterModel.create(character);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('bad request', HttpStatus.BAD_REQUEST);
        }
    }
}
