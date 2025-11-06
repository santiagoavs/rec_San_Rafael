import nodemailer from 'nodemailer';
import { config } from '../config.js';

/**
 * Crear transportador de email
 */
const transporter = nodemailer.createTransport({
  host: config.EMAIL.host,
  port: config.EMAIL.port,
  secure: config.EMAIL.secure,
  auth: {
    user: config.EMAIL.user,
    pass: config.EMAIL.pass
  }
});

/**
 * Enviar email de recuperación de contraseña
 */
export const sendPasswordRecoveryEmail = async (email, code, nombre) => {
  try {

    const mailOptions = {
      from: config.EMAIL.from,
      to: email,
      subject: 'Recuperación de Contraseña - San Rafael',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #2c3e50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .code-box {
              background-color: #ecf0f1;
              border: 2px dashed #3498db;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 5px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #2c3e50;
              letter-spacing: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #7f8c8d;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 San Rafael</h1>
              <p>Sistema Médico</p>
            </div>
            <div class="content">
              <h2>Hola ${nombre},</h2>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              
              <p>Tu código de recuperación es:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este código expira en <strong>15 minutos</strong></li>
                  <li>Solo tienes <strong>3 intentos</strong> para ingresar el código correcto</li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                </ul>
              </div>
              
              <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
              
              <p>Saludos,<br>
              <strong>Equipo de San Rafael</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} San Rafael. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

export default {
  sendPasswordRecoveryEmail
};
