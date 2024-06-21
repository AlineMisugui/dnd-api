import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AbilityScoreDto {

    @IsString()
    @IsNotEmpty()
    index: string;

    @IsString()
    @IsNotEmpty()
    value: number;
}
