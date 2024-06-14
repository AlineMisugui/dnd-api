import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class EquipamentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    amount: number;
}
