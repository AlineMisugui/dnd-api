import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator'

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsString()
    @IsOptional()
    name: string

    @IsNumber()
    @Min(1.0)
    @IsOptional()

    price: number

    @IsNumber()
    @Min(0)
    @IsOptional()
    amount: number
}
