export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendVerificationEmailOptions {
  email: string;
  token: string;
  username: string;
}

export interface SendPasswordResetEmailOptions {
  email: string;
  token: string;
}
