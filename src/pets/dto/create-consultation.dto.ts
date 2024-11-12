import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateConsultationDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  veterinarian: string;

  @IsNotEmpty()
  @IsString()
  procedure: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}
