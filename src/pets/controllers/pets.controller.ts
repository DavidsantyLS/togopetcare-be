import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PetsService } from '../services/pets.service';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { CreateVaccineDto } from '../dto/create-vaccine.dto';
import { CreateDewormingDto } from '../dto/create-deworming.dto';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/auth/multer.config';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  create(
    @Body() createPetDto: CreatePetDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.petsService.create(createPetDto, file);
  }

  @Get()
  findAll() {
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Get('/owner/:id')
  findByOwner(@Param('id') id: string) {
    return this.petsService.findAllByOwner(id);
  }

  @Post(':id/vaccine')
  @UseInterceptors(FileInterceptor('vaccine', multerOptions))
  addVaccine(
    @Param('id') id: string,
    @Body() vaccineData: CreateVaccineDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.petsService.addVaccine(id, vaccineData, file);
  }

  @Delete(':id/vaccine/:id_vaccine')
  removeVaccine(
    @Param('id') id: string,
    @Param('id_vaccine') id_vaccine: string,
  ) {
    return this.petsService.removeVaccine(id, id_vaccine);
  }

  @Patch(':petId/vaccine/:vaccineId')
  @UseInterceptors(FileInterceptor('vaccine', multerOptions))
  async updateVaccine(
    @Param('petId') petId: string,
    @Param('vaccineId') vaccineId: string,
    @Body() vaccineData: Partial<CreateVaccineDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.petsService.patchVaccine(petId, vaccineId, vaccineData, file);
  }

  @Post(':id/deworming')
  addDeworming(
    @Param('id') id: string,
    @Body() dewormingData: CreateDewormingDto,
  ) {
    return this.petsService.addDeworming(id, dewormingData);
  }

  @Delete(':id/deworming/:id_deworming')
  removeDeworming(
    @Param('id') id: string,
    @Param('id_deworming') id_deworming: string,
  ) {
    return this.petsService.removeDeworming(id, id_deworming);
  }

  @Post(':id/consultation')
  addConsultation(
    @Param('id') id: string,
    @Body() consultationData: CreateConsultationDto,
  ) {
    return this.petsService.addConsultation(id, consultationData);
  }

  @Delete(':id/consultation/:id_consultation')
  removeConsultation(
    @Param('id') id: string,
    @Param('id_consultation') id_consultation: string,
  ) {
    return this.petsService.removeConsultation(id, id_consultation);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.petsService.update(id, updatePetDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
