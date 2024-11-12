import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Deworming {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dateAdministered: Date;

  @Prop()
  nextDueDate?: Date;

  @Prop()
  dosage?: string;

  @Prop()
  administeredBy?: string;
}

export const DewormingSchema = SchemaFactory.createForClass(Deworming);
