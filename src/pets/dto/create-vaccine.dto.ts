import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  isString,
} from 'class-validator';

export class CreateVaccineDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  dateAdministered: Date;

  @IsOptional()
  @IsString()
  tagImage: string;

  @IsOptional()
  @IsString()
  nextDueDate?: Date;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  administeredBy?: string;
}
