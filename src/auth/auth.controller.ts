import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDto } from './dto/register-dto';
import { TAuthGuard } from '../guards/auth.guard';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer.config';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('retrieve-facebook-user')
  async retrieveObject(@Query('token') token: string) {
    const user = await this.authService.retrieveTemporaryData(token);

    if (user) {
      return { success: true, data: user };
    } else {
      return { success: false, message: 'Object not found' };
    }
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(TAuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponse {
    const user = req['user'] as User;

    return {
      user,
      token: this.authService.getJwtToken({ id: user._id }),
    };
  }

  @UseGuards(TAuthGuard)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(TAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @UseGuards(TAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(email);
    return {
      message: 'email sent',
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been reset' };
  }

  @Get('/google')
  google(@Req() req) {}

  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.loginWithGoogle(req);
    return res.redirect(
      `http://localhost:4200/auth/post-login?token=${user.token}&&user=${user.user._id}`,
    );
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req) {}

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.facebookFlow(req);
    if (user.message === 'required email') {
      const token = await this.authService.storeTemporaryData(
        user.facebook_user,
        10,
      );
      return res.redirect(
        `http://localhost:4200/auth/post-login?require-email=${true}&&fb-token=${token}`,
      );
    }
    return res.redirect(
      `http://localhost:4200/auth/post-login?token=${user.token}&&user=${user.user._id}`,
    );
  }

  @Post('complete-facebook-login')
  async completeFacebookLogin(@Body() body) {
    return this.authService.completeFacebookLogin(body);
  }

  //TODO: Migrar a un S3
  @Post(':id/upload-avatar')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.uploadAvatar(id, file);
  }
}
