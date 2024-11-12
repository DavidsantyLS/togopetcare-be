import { PartialType } from '@nestjs/mapped-types';
import { CreateVaccineDto } from './create-vaccine.dto';

export class UpdateVacinneDto extends PartialType(CreateVaccineDto) {}
