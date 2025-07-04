const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your_email@example.com',
    pass: process.env.EMAIL_PASS || 'your_password',
  },
});

const sendTicketUpdateEmail = async (toEmail, ticketId, ticketTitle, updateMessage) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Helpster Support" <support@helpster.com>',
    to: toEmail,
    subject: `Atualização do Ticket #${ticketId}: ${ticketTitle}`,
    html: `
      <p>Olá,</p>
      <p>Seu ticket <strong>#${ticketId} - ${ticketTitle}</strong> foi atualizado.</p>
      <p>${updateMessage}</p>
      <p>Acesse o sistema para mais detalhes.</p>
      <p>Atenciosamente,<br/>Equipe Helpster</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de atualização do ticket #${ticketId} enviado para ${toEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de atualização do ticket #${ticketId} para ${toEmail}:`, error);
  }
};

const sendTicketAssignedEmail = async (toEmail, ticketId, ticketTitle, agentName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Helpster Support" <support@helpster.com>',
    to: toEmail,
    subject: `Ticket #${ticketId} Atribuído a Você`,
    html: `
      <p>Olá,</p>
      <p>O ticket <strong>#${ticketId} - ${ticketTitle}</strong> foi atribuído a você.</p>
      <p>O agente responsável é: ${agentName}</p>
      <p>Acesse o sistema para gerenciar o ticket.</p>
      <p>Atenciosamente,<br/>Equipe Helpster</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de atribuição do ticket #${ticketId} enviado para ${toEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de atribuição do ticket #${ticketId} para ${toEmail}:`, error);
  }
};

module.exports = {
  sendTicketUpdateEmail,
  sendTicketAssignedEmail,
};
