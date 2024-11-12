import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';

const templateDir =
  process.env.NODE_ENV === 'production'
    ? join(__dirname, 'template') // for production, relative to dist
    : join(process.cwd(), 'src/email/templates'); // for development, relative to src

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Ruta de la carpeta uploads
      serveRoot: '/uploads/', // URL base para acceder a archivos estáticos
    }),
    MailerModule.forRoot({
      transport: {
        host: String(process.env.MAIL_HOST),
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>', 
      },
      template: {
        dir: templateDir, 
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    PetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
