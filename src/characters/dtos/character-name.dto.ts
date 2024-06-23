import { IsEmpty, IsNotEmpty, IsString } from "class-validator";

export class CharacterNameDto {

    @IsString()
    @IsNotEmpty()
    name: string
}