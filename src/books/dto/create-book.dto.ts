import { IsString, MinLength, MaxLength, IsNumber, Min, Max } from 'class-validator'

export class CreateBookDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  price: number;
  author: string;
  ISBN: string;
}
