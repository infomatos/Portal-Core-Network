import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Portal CNE" <${process.env.EMAIL_FROM}>`,
        to,
        subject: 'Redefinição de senha — Portal CNE',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                <h2 style="color: #1e293b;">Redefinição de senha</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no Portal CNE.</p>
                <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
                <a href="${resetUrl}"
                   style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1e293b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                    Redefinir senha
                </a>
                <p style="color:#64748b;font-size:13px;">Se você não solicitou isso, ignore este e-mail.</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                <p style="color:#94a3b8;font-size:12px;">Portal Core Network Engineering — TIM Brasil</p>
            </div>
        `,
    });
}
