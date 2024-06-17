import { IsNumber, IsString } from "class-validator";

export class CreateResponseTimeLoggerDto {
    @IsString()
    method: string;
    @IsString()
    route: string;
    @IsNumber()
    responseTimeMiliseconds: number;
    @IsNumber()
    statusCode: number;
}
