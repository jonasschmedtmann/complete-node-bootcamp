const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //Create transporter: Mail service Provider
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //Define the email options

  const mailOptions = {
    from: 'Mahmoud Awad <awd-dev@awd.dev>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Start Sending
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
