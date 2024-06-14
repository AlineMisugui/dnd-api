import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from "class-validator";
import { AbilityScoreDto } from "./ability-score.dto";
import { EquipamentDto } from "./equipament.dto";

export class CreateCharacterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    alignment: string;

    @IsObject()
    abilityScore: AbilityScoreDto;

    @IsString()
    @IsNotEmpty()
    race: string;

    @IsString()
    @IsNotEmpty()
    class: string;

    @IsNumber()
    @Min(1)
    level: number

    @IsString()
    @IsNotEmpty()
    feats: string

    @IsArray()
    equipament: EquipamentDto[];

    @IsArray()
    @IsOptional()
    spells: string[];
}