import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendNotificationEmail(
    to: string,
    subject: string,
    data: any,
    template: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`,
      context: {
        ...data,
      },
    });
  }
}
