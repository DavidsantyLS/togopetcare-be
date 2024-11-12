import { IsEmail, IsString } from 'class-validator';

export class CreateEmailDto {
    @IsEmail()
    to: string;
  
    @IsString()
    subject: string;
    
    @IsString()
    text: string;
}
