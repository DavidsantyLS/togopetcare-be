import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';

export class CreateDewormingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  dateAdministered: string;

  @IsOptional()
  @IsString()
  nextDueDate?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  administeredBy?: string;
}
