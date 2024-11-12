import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsString, ValidateNested } from 'class-validator';

class LoginFromDto {
  @IsBoolean()
  google: boolean;

  @IsBoolean()
  facebook: boolean;

  @IsBoolean()
  apple: boolean;
}

class AddressDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  postal_code: string;

  @IsString()
  department: string;
}

class PreferencesDto {
  @IsString()
  language: string;
}

export class UpdateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  birth_date: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address_information: AddressDto;

  @ValidateNested()
  @Type(() => LoginFromDto)
  login_from: LoginFromDto;

  @IsString()
  facebook_id: string;

  @IsString()
  google_id: string;

  @IsString()
  avatar: string;

  @IsBoolean()
  verified: boolean;

  @IsString()
  role: string;

  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;

  @IsString()
  membership_expiration: string;

  @IsString()
  gender: string;

  @IsBoolean()
  active: boolean;
}
