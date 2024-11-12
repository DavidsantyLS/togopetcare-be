import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register-dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { TemporaryFacebookData } from './entities/temporal-facebook.entity';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectModel(TemporaryFacebookData.name)
    private tempFacebookDataModel: Model<TemporaryFacebookData>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;

    const existingUser = await this.userModel.findOne({
      email: userData.email,
    });

    if (existingUser) {
      if (existingUser.login_from && existingUser.login_from.google) {
        throw new BadRequestException('user linked with google');
      }
      if (existingUser.login_from && existingUser.login_from.facebook) {
        throw new BadRequestException('user linked with facebook');
      }
      throw new BadRequestException(
        `The email ${createUserDto.email} is already registered!`,
      );
    }

    const newUser = new this.userModel({
      password: bcryptjs.hashSync(password, 10),
      ...userData,
    });
    await newUser.save();

    const { password: _, ...user } = newUser.toJSON();

    return user;
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.create(registerDto);
    await this.sendEmail(user.email, 'Bienvenido a Togopercare', {}, 'welcome');

    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Not valid credentials (email)');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new BadRequestException('Not valid credentials (password)');
    }
    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async loginWithGoogle(req: any): Promise<LoginResponse> {
    const googleUser = req.user;
    let user = await this.userModel.findOne({
      $or: [{ google_id: googleUser.id }, { email: googleUser.email }],
    });
    if (!user) {
      user = new this.userModel({
        google_id: googleUser.id,
        email: googleUser.email,
        password: ' ',
        active: true,
        verified: true,
        login_from: { google: true, facebook: false, apple: false },
        first_name: googleUser.firstName,
        last_name: googleUser.lastName,
        avatar: googleUser.picture,
      });
      await this.sendEmail(
        user.email,
        'Bienvenido a Togopercare',
        {},
        'welcome',
      );
      await user.save();
    } else {
      let updated = false;
      if (!user.active) {
        user.active = true;
        updated = true;
      }

      if (!user.google_id) {
        user.google_id = googleUser.id;
        updated = true;
      }

      if (!user.verified) {
        user.verified = true;
        updated = true;
      }
      if (user.login_from.google !== true) {
        user.login_from.google = true;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      message: 'Login from Google',
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async storeTemporaryData(
    data: Record<string, any>,
    ttlMinutes: number,
  ): Promise<string> {
    const id = uuidv4();
    const expirationDate = new Date(Date.now() + ttlMinutes * 60000);

    const temporaryData = new this.tempFacebookDataModel({
      id,
      data,
      expiresAt: expirationDate,
    });

    await temporaryData.save();
    return id;
  }

  async retrieveTemporaryData(
    id: string,
  ): Promise<TemporaryFacebookData | null> {
    const data = await this.tempFacebookDataModel.findOne({ id }).exec();
    if (!data) {
      throw new BadRequestException('not data found');
    }
    return data;
  }

  async facebookFlow(req: any): Promise<any> {
    const facebook_user = req.user;

    // Si Facebook proporciona un email, proceder con el login o registro
    if (facebook_user.email && facebook_user.email.trim() !== '') {
      return this.loginWithFacebook(req);
    }

    // Si no se proporciona el email, verificar si existe el usuario en la base de datos
    const existingUser = await this.userModel.findOne({
      facebook_id: facebook_user.id,
    });

    // Si el usuario existe y tiene un correo, seguir con el flujo normal de login
    if (
      existingUser &&
      existingUser.email &&
      existingUser.email.trim() !== ''
    ) {
      return this.loginWithFacebook(req);
    }

    // Si no tiene un correo, retornar al frontend los datos de Facebook y el flag
    return {
      message: 'required email',
      facebook_user, // Retornar los datos de Facebook al frontend
      requireEmail: true, // Este flag indica al frontend que necesita pedir el correo
    };
  }

  async completeFacebookLogin(body) {
    const { facebook_user, email } = body;

    // Verificar si ya existe un usuario con este correo
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      // Si existe, vincular la cuenta de Facebook y continuar con el flujo de login
      existingUser.facebook_id = facebook_user.id;
      existingUser.login_from.facebook = true;
      await existingUser.save();

      // Retornar el usuario y el token
      const token = this.getJwtToken({ id: existingUser.id });
      return {
        message:
          'Login con Facebook completado y vinculado con una cuenta existente',
        user: existingUser,
        token,
      };
    }

    // Si el correo no existe, actualizar el usuario temporal con el nuevo correo
    const newUser = new this.userModel({
      facebook_id: facebook_user.id,
      email: email,
      first_name: facebook_user.firstName,
      last_name: facebook_user.lastName,
      avatar: facebook_user.picture,
      login_from: { google: false, facebook: true, apple: false },
      active: true,
      verified: true,
    });
    await newUser.save();

    // Generar el token JWT
    const token = this.getJwtToken({ id: newUser.id });

    // Retornar el nuevo usuario y el token
    return {
      message: 'Registro y login completados con Facebook',
      user: newUser,
      token,
    };
  }

  private async loginWithFacebook(req: any): Promise<LoginResponse> {
    const facebookUser = req.user;

    let user = await this.userModel.findOne({
      $or: [{ facebook_id: facebookUser.id }, { email: facebookUser.email }],
    });

    if (!user) {
      user = new this.userModel({
        facebook_id: facebookUser.id,
        email: facebookUser.email || ' ',
        password: ' ',
        active: true,
        verified: true,
        login_from: { google: false, facebook: true, apple: false },
        first_name: facebookUser.firstName,
        last_name: facebookUser.lastName,
        avatar: facebookUser.picture,
      });
      await this.sendEmail(
        user.email,
        'Bienvenido a Togopercare',
        {},
        'welcome',
      );
      await user.save();
    } else {
      let updated = false;

      if (!user.active) {
        user.active = true;
        updated = true;
      }

      if (!user.facebook_id) {
        user.facebook_id = facebookUser.id;
        updated = true;
      }

      if (!user.verified) {
        user.verified = true;
        updated = true;
      }

      if (user.login_from.facebook !== true) {
        user.login_from.facebook = true;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      message: 'Login from Facebook',
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new UnauthorizedException('Not valid credentials (email)');
    }
    const { password, ...updatedUser } = user.toObject();

    return updatedUser;
  }

  async uploadAvatar(id: string, file: Express.Multer.File) {
    try {
      const filePath = `http://localhost:3000/uploads/avatars/${file.filename}`;

      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      user.avatar = filePath;

      await user.save();

      return { message: 'Avatar actualizado exitosamente', avatar: filePath };
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Error al subir el avatar.');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateAuthDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new BadRequestException('USER_NOT_FOUND');
      }

      Object.assign(user, updateUserDto);

      await user.save();

      const { password, ...updatedUser } = user.toObject();

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong!');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userModel.deleteOne({ _id: id });
    return { message: 'User successfully deleted' };
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = randomBytes(32).toString('hex');

    user.reset_password_token = token;
    user.reset_password_expires = new Date(Date.now() + 3600000);
    await user.save();

    const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}`;
    await this.sendEmail(
      user.email,
      'Solicitud de restablecimiento de contraseña',
      {
        name: `${user.first_name} ${user.last_name}`,
        resetUrl,
      },
      'forgot-password',
    );
  }

  async resetPassword(
    reset_password_token: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({ reset_password_token });
    if (!user || user.reset_password_expires < new Date()) {
      throw new BadRequestException('Token invalid or expired');
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();
  }

  private async sendEmail(
    email: string,
    subject: string,
    data: any,
    template: string,
  ) {
    await this.emailService.sendNotificationEmail(
      email,
      subject,
      {
        ...data,
      },
      template,
    );
  }
}
