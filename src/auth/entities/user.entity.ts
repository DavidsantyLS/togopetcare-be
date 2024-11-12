import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop()
  first_name?: string;

  @Prop()
  last_name?: string;

  @Prop()
  birth_date?: string;

  @Prop()
  phone?: string;

  @Prop({ enum: ['male', 'female', 'other'], default: 'other' })
  gender: string;

  @Prop({
    type: {
      google: { type: Boolean, default: false },
      facebook: { type: Boolean, default: false },
      apple: { type: Boolean, default: false },
    },
  })
  login_from?: {
    google: boolean;
    facebook: boolean;
    apple: boolean;
  };

  @Prop()
  facebook_id?: string;

  @Prop()
  google_id?: string;

  @Prop({
    type: {
      address: { type: String },
      city: { type: String },
      postal_code: { type: String },
      department: { type: String },
    },
  })
  address_information?: {
    address: string;
    city: string;
    postal_code: string;
    department: string;
  };

  @Prop({
    type: {
      language: { type: String, default: 'en' },
    },
  })
  preferences?: {
    language: string;
  };

  @Prop()
  membership_expiration?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({
    enum: ['admin', 'premium', 'user', 'veterinarian', 'seller', 'walker'],
    default: 'user',
  })
  role: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  reset_password_token?: string;

  @Prop()
  reset_password_expires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
