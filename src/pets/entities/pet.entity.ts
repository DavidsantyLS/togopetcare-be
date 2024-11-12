import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Consultation, ConsultationSchema } from './consultation.entity';
import { Deworming, DewormingSchema } from './deworming.entity';
import { Vaccine, VaccineSchema } from './vaccine.entity';

export type PetDocument = Pet & Document;

@Schema({ timestamps: true })
export class Pet {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  birth_date: Date;

  @Prop({ required: true })
  sex: string;

  @Prop({ required: true })
  species: string;

  @Prop({ required: true })
  breed: string;

  @Prop()
  color?: string;

  @Prop()
  weight?: number;

  @Prop()
  image?: string;

  @Prop({ type: [VaccineSchema], default: [] })
  vaccines: Vaccine[];

  @Prop({ type: [DewormingSchema], default: [] })
  dewormings: Deworming[];

  @Prop({
    type: {
      consultations: { type: [ConsultationSchema], default: [] },
    },
  })
  history?: {
    consultations: Consultation[];
  };

  @Prop()
  microchip_id?: string;

  @Prop({ default: false })
  sterilized: boolean;

  @Prop()
  notes?: string;

  @Prop()
  diet?: string; 

  @Prop()
  allergies?: string; 
}

export const PetSchema = SchemaFactory.createForClass(Pet);
