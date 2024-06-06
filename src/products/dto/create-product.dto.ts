import { IsString, IsNumber, Min } from 'class-validator'

export class CreateProductDto {
    @IsString()
    name: string

    @IsNumber()
    @Min(1.0)
    price: number

    @IsNumber()
    @Min(0)
    amount: number
}
