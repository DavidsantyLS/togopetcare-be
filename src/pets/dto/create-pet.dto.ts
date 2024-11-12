import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateConsultationDto } from './create-consultation.dto';
import { CreateDewormingDto } from './create-deworming.dto';
import { CreateVaccineDto } from './create-vaccine.dto';

export class CreatePetDto {
  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  birth_date: string;

  @IsNotEmpty()
  @IsString()
  sex: string;

  @IsNotEmpty()
  @IsString()
  species: string;

  @IsNotEmpty()
  @IsString()
  breed: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  weight?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  vaccines?: CreateVaccineDto[];

  @IsOptional()
  dewormings?: CreateDewormingDto[];

  @IsOptional()
  history?: {
    consultations: CreateConsultationDto[];
  };

  @IsOptional()
  @IsString()
  microchip_id?: string;

  @IsOptional()
  @IsString()
  sterilized?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  diet?: string;

  @IsOptional()
  @IsString()
  allergies?: string;
}
