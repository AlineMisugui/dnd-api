import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from "class-validator";
import { HydratedDocument } from "mongoose";

export type CharacterDocument = HydratedDocument<Character>

export class AbilityScore {
    @Prop()
    cha: number;

    @Prop()
    con: number;

    @Prop()
    dex: number;

    @Prop()
    int: number;

    @Prop()
    str: number;

    @Prop()
    wis: number;
}

export class Equipament {
    @Prop()
    name: string;

    @Prop()
    amount: number;
}

@Schema()
export class Character {

    @IsString()
    @IsNotEmpty()
    @Prop()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Prop()
    alignment: string;

    @IsObject()
    @Prop()
    abilityScore: AbilityScore;

    @IsString()
    @IsNotEmpty()
    @Prop()
    race: string;

    @IsString()
    @IsNotEmpty()
    @Prop()
    class: string;

    @IsNumber()
    @Min(1)
    @Prop()
    level: number

    @IsString()
    @IsNotEmpty()
    @Prop()
    feats: string

    @IsObject()
    @Prop()
    equipament: Equipament[];

    @IsArray()
    @IsOptional()
    @Prop()
    spells: string[];
}

export const characterSchema = SchemaFactory.createForClass(Character);