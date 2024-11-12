import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemporaryFacebookDataDocument = TemporaryFacebookData & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } }) // Only createdAt, no updatedAt
export class TemporaryFacebookData {
  @Prop({ required: true })
  id: string;

  @Prop({ type: Object, required: true }) // Schema.Types.Mixed equivalent
  data: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const TemporaryFacebookDataSchema = SchemaFactory.createForClass(
  TemporaryFacebookData,
);
TemporaryFacebookDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
