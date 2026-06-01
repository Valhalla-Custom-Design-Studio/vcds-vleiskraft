import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  appName: string = 'VleisKraft™'
): Promise<void> {
  const resetUrl = `${process.env.APP_URL || 'https://vleiskraft.vcds.co.za'}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to,
    subject: `${appName}  -  Password Reset Request`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#7F1D1D;">${appName}</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#7F1D1D;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#666;font-size:13px;">
          This link expires in 1 hour. If you did not request a reset, ignore this email.
        </p>
        <p style="color:#999;font-size:11px;">VCDS Holdings · Heidelberg, Gauteng, South Africa</p>
      </div>
    `,
    text: `Reset your ${appName} password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}
