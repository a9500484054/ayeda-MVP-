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
    const frontendUrl = this.configService.get('FRONTEND_URL', 'https://ayeda.ru');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = this.generateEmailTemplate({
      title: 'Подтверждение email адреса',
      username,
      buttonText: 'Подтвердить Email',
      buttonUrl: verificationUrl,
      buttonColor: '#0d542b', // emerald green
      message: 'Для завершения регистрации и подтверждения вашего email адреса, пожалуйста, нажмите на кнопку ниже:',
      additionalInfo: 'Если вы не регистрировались в нашем сервисе, просто проигнорируйте это письмо.',
      features: [
        { icon: '✨', text: '14 дней бесплатного доступа' },
        { icon: '🍳', text: '500+ проверенных рецептов' },
        { icon: '🛒', text: 'Умные списки покупок' },
      ],
      quote: {
        text: '"Регистрация заняла 30 секунд, а результат — экономия 5 часов в неделю!"',
        author: '— Дмитрий, пользователь AyEda',
      },
    });

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
    const frontendUrl = this.configService.get('FRONTEND_URL', 'https://ayeda.ru');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = this.generateEmailTemplate({
      title: 'Сброс пароля',
      username: null,
      buttonText: 'Сбросить пароль',
      buttonUrl: resetUrl,
      buttonColor: '#dc3545', // red for password reset
      message: 'Вы запросили сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль:',
      additionalInfo: 'Ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.',
      features: null,
      quote: null,
    });

    return this.sendEmail({
      to: email,
      subject: 'Сброс пароля',
      html,
    });
  }

  private generateEmailTemplate({
    title,
    username,
    buttonText,
    buttonUrl,
    buttonColor,
    message,
    additionalInfo,
    features,
    quote,
  }: {
    title: string;
    username: string | null;
    buttonText: string;
    buttonUrl: string;
    buttonColor: string;
    message: string;
    additionalInfo: string;
    features?: { icon: string; text: string }[] | null;
    quote?: { text: string; author: string } | null;
  }): string {
    const greeting = username ? `${username},` : '';

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            margin: 0;
            padding: 20px;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          /* Header - Gradient from emerald to teal */
          .header {
            background: linear-gradient(135deg, #047857 0%, #0f766e 100%);
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: -40%;
            right: -20%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            pointer-events: none;
          }

          .header::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -20%;
            width: 250px;
            height: 250px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            pointer-events: none;
          }

          .logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px 24px;
            border-radius: 60px;
            margin-bottom: 32px;
            position: relative;
            z-index: 1;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #047857 0%, #0f766e 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }

          .logo-text {
            font-size: 24px;
            font-weight: 800;
            color: #047857;
            letter-spacing: -0.5px;
          }

          .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
            letter-spacing: -0.5px;
          }

          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            position: relative;
            z-index: 1;
          }

          /* Content */
          .content {
            padding: 48px 40px;
            background: white;
          }

          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
          }

          .message {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
          }

          /* Button */
          .button-container {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            background-color: ${buttonColor};
            color: white;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }

          /* Fallback URL */
          .fallback-url {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
          }

          .fallback-url p {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 8px;
          }

          .fallback-url a {
            color: ${buttonColor};
            text-decoration: none;
            word-break: break-all;
            font-size: 14px;
          }

          .additional-info {
            background: #fefce8;
            border-left: 4px solid #eab308;
            padding: 16px;
            border-radius: 12px;
            margin: 24px 0;
            font-size: 14px;
            color: #854d0e;
          }

          /* Features section */
          .features {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border-radius: 20px;
            padding: 24px;
            margin: 32px 0;
          }

          .features-title {
            font-weight: 700;
            color: #065f46;
            margin-bottom: 16px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            color: #064e3b;
            font-size: 14px;
          }

          .feature-icon {
            font-size: 18px;
          }

          /* Quote */
          .quote {
            background: linear-gradient(135deg, rgba(4, 120, 87, 0.05) 0%, rgba(15, 118, 110, 0.05) 100%);
            border-radius: 20px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
            border: 1px solid rgba(4, 120, 87, 0.1);
          }

          .quote-text {
            font-style: italic;
            color: #374151;
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 12px;
          }

          .quote-author {
            color: #047857;
            font-size: 13px;
            font-weight: 500;
          }

          /* Footer */
          .footer {
            background: #f9fafb;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }

          .footer-text {
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.5;
          }

          .copyright {
            margin-top: 12px;
            color: #d1d5db;
            font-size: 11px;
          }

          @media (max-width: 600px) {
            .content {
              padding: 32px 24px;
            }
            .header {
              padding: 32px 24px;
            }
            .header h1 {
              font-size: 26px;
            }
            .button {
              padding: 12px 28px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with gradient background -->
          <div class="header">
            <div class="logo">
              <span class="logo-text">AyEda</span>
            </div>
            <h1>${title}</h1>
            <p>Планируйте питание с удовольствием</p>
          </div>

          <!-- Content -->
          <div class="content">
            ${greeting ? `<div class="greeting">${greeting}</div>` : ''}

            <div class="message">
              ${message}
            </div>

            <div class="button-container">
              <a href="${buttonUrl}" class="button" style="color: white; background-color: ${buttonColor};">
                ${buttonText}
              </a>
            </div>

            <div class="fallback-url">
              <p>Или скопируйте ссылку в браузер:</p>
              <a href="${buttonUrl}" style="color: ${buttonColor};">${buttonUrl}</a>
            </div>

            <div class="additional-info">
              ${additionalInfo}
            </div>

            ${quote ? `
              <div class="quote">
                <div class="quote-text">${quote.text}</div>
                <div class="quote-author">${quote.author}</div>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">
              Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.
            </div>
            <div class="copyright">
              © ${new Date().getFullYear()} АуЕда. Все права защищены.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
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
