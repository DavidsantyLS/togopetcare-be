import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/email/email.module';
import { TAuthGuard } from 'src/guards/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './entities/user.entity';
import { GoogleStrategy } from './strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { FacebookStrategy } from './strategy/facebook.strategy';
import {
  TemporaryFacebookData,
  TemporaryFacebookDataSchema,
} from './entities/temporal-facebook.entity';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: TemporaryFacebookData.name, schema: TemporaryFacebookDataSchema },
    ]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TAuthGuard, GoogleStrategy, FacebookStrategy],
  exports: [MongooseModule, AuthService, TAuthGuard],
})
export class AuthModule {}
