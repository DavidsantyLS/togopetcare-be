import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Consultation,
  ConsultationSchema,
  Deworming,
  DewormingSchema,
  Pet,
  PetSchema,
  Vaccine,
  VaccineSchema,
} from './entities';
import { PetsController } from './controllers/pets.controller';
import { PetsService } from './services/pets.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Pet.name,
        schema: PetSchema,
      },
      { name: Vaccine.name, schema: VaccineSchema },
      { name: Deworming.name, schema: DewormingSchema },
      { name: Consultation.name, schema: ConsultationSchema },
    ]),
  ],
})
export class PetsModule {}
