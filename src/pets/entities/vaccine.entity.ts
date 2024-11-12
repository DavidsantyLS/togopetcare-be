import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Vaccine {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dateAdministered: Date;

  @Prop()
  nextDueDate?: Date;

  @Prop()
  tagImage?: string;

  @Prop()
  dosage?: string;

  @Prop()
  administeredBy?: string;
}

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);
