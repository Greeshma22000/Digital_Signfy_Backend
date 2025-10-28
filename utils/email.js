import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();

// ✅ Setup transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // e.g. yourname@gmail.com
    pass: process.env.EMAIL_PASS        // App Password
  }
});

// ✅ The function that uses the transporter
export const sendSignatureRequestEmail = async (recipientEmail, signerName, link) => {
  const mailOptions = {
    from: `"Seal the Sign" <${process.env.EMAIL_USER}>`,
    to : recipientEmail, // ✅ explicit and safe
    subject: 'You have a document to sign',
    html: `
      <p>Hi ${signerName},</p>
      <p>You have been requested to sign a document on <b>Seal the Sign</b>.</p>
      <p><a href="${link}" target="_blank">Click here to sign the document</a></p>
    `
  };

  await transporter.sendMail(mailOptions);
};
