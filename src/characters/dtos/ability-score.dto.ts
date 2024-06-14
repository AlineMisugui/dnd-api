import { IsNumber } from "class-validator";

export class AbilityScoreDto {
    @IsNumber()
    cha: number;

    @IsNumber()
    con: number;

    @IsNumber()
    dex: number;

    @IsNumber()
    int: number;

    @IsNumber()
    str: number;

    @IsNumber()
    wis: number;
}
