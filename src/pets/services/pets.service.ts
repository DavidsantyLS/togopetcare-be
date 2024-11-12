import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { Pet, PetDocument } from '../entities';
import { CreateVaccineDto } from '../dto/create-vaccine.dto';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { CreateDewormingDto } from '../dto/create-deworming.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
  ) {}

  async create(
    createPetDto: CreatePetDto,
    file?: Express.Multer.File,
  ): Promise<Pet> {
    if (file) {
      createPetDto.image = `http://localhost:3000/uploads/pets/${file.filename}`;
    }
    const newPet = new this.petModel(createPetDto);
    return newPet.save();
  }

  async addVaccine(
    petId: string,
    vaccineData: CreateVaccineDto,
    file?: Express.Multer.File,
  ): Promise<Pet> {
    if (file) {
      vaccineData.tagImage = `http://localhost:3000/uploads/vaccines/${file.filename}`;
    }

    const pet = await this.petModel
      .findByIdAndUpdate(
        petId,
        { $push: { vaccines: vaccineData } },
        { new: true, upsert: false },
      )
      .exec();

    return pet;
  }

  async patchVaccine(
    petId: string,
    vaccineId: string,
    vaccineData: Partial<CreateVaccineDto>,
    file?: Express.Multer.File,
  ): Promise<Pet> {
    if (file) {
      vaccineData.tagImage = `http://localhost:3000/uploads/vaccines/${file.filename}`;
    }

    const pet = await this.petModel.findOneAndUpdate(
      { _id: petId, 'vaccines._id': vaccineId },
      {
        $set: {
          'vaccines.$': { ...vaccineData, _id: vaccineId },
        },
      },
      { new: true },
    );

    if (!pet) {
      throw new NotFoundException('Pet or vaccine not found');
    }

    return pet;
  }

  async removeVaccine(petId: string, vaccineId: string): Promise<Pet> {
    return this.petModel
      .findByIdAndUpdate(
        petId,
        { $pull: { vaccines: { _id: vaccineId } } },
        { new: true },
      )
      .exec();
  }

  async addConsultation(
    petId: string,
    consultationData: CreateConsultationDto,
  ): Promise<Pet> {
    return this.petModel
      .findByIdAndUpdate(
        petId,
        { $push: { 'history.consultations': consultationData } },
        { new: true },
      )
      .exec();
  }

  async removeConsultation(
    petId: string,
    consultationId: string,
  ): Promise<Pet> {
    return this.petModel
      .findByIdAndUpdate(
        petId,
        { $pull: { 'history.consultations': { _id: consultationId } } },
        { new: true },
      )
      .exec();
  }

  async addDeworming(
    petId: string,
    DewormingData: CreateDewormingDto,
  ): Promise<Pet> {
    return this.petModel
      .findByIdAndUpdate(
        petId,
        { $push: { dewormings: DewormingData } },
        { new: true },
      )
      .exec();
  }

  async removeDeworming(petId: string, dewormingId: string): Promise<Pet> {
    return this.petModel
      .findByIdAndUpdate(
        petId,
        { $pull: { dewormings: { _id: dewormingId } } },
        { new: true },
      )
      .exec();
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.find().exec();
  }

  async findAllByOwner(ownerId: string): Promise<Pet[]> {
    return this.petModel.find({ owner: ownerId }).exec();
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petModel.findById(id).exec();
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return pet;
  }

  async update(
    id: string,
    updatePetDto: UpdatePetDto,
    file?: Express.Multer.File,
  ): Promise<Pet> {
    if (file) {
      updatePetDto.image = `http://localhost:3000/uploads/pets/${file.filename}`;
    }
    const updatedPet = await this.petModel
      .findByIdAndUpdate(id, updatePetDto, { new: true })
      .exec();
    if (!updatedPet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return updatedPet;
  }

  async remove(id: string): Promise<Pet> {
    const deletedPet = await this.petModel.findByIdAndDelete(id).exec();
    if (!deletedPet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return deletedPet;
  }
}
