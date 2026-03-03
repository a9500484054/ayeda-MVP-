import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EmailOptions,
  SendVerificationEmailOptions,
  SendPasswordResetEmailOptions,
} from './interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.yandex.ru'),
      port: this.configService.get('SMTP_PORT', 465),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail({
    email,
    token,
    username,
  }: SendVerificationEmailOptions): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Подтверждение email адреса</h2>
        <p>${username}, для завершения регистрации и подтверждения вашего email адреса, пожалуйста, нажмите на кнопку ниже:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #007bff; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Подтвердить Email
          </a>
        </div>
        <p>Или скопируйте и вставьте в браузер следующую ссылку:</p>
        <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
        <p>Если вы не регистрировались в нашем сервисе, просто проигнорируйте это письмо.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Подтверждение email адреса',
      html,
    });
  }

  async sendPasswordResetEmail({
    email,
    token,
  }: SendPasswordResetEmailOptions): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Сброс пароля</h2>
        <p>Для сброса пароля нажмите на кнопку ниже:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #dc3545; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Сбросить пароль
          </a>
        </div>
        <p>Или скопируйте и вставьте в браузер следующую ссылку:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        <p><strong>Внимание:</strong> Ссылка действительна в течение 1 часа.</p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Сброс пароля',
      html,
    });
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'ayedaru@yandex.ru'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }
}
