import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Consultation {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  veterinarian: string;

  @Prop({ required: true })
  procedure: string;

  @Prop([String])
  documents?: string[];
}

export const ConsultationSchema = SchemaFactory.createForClass(Consultation);