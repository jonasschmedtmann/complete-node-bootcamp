const nodemailer = require('nodemailer');
//const dotenv = require('dotenv');
//dotenv.config({ path: './config.env' });

//nodemailer function
const sendEmail = async (options) => {
  //1. create a transporter
  //try{  ***** Do not catch errro here catch it in auth controller so that you can return it to the client*****
  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    //auth: {
    //user: process.env.EMAIL_USERNAME,
    //pass: process.env.EMAIL_PASSWORD,
    //const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Activate in gmail is not a prod grade but can use sendGrid

  //2. Define the email options
  const mailOptions = {
    from: 'Chandan Sharma <chndan.shr@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3. Send email
  await transporter.sendMail(mailOptions);
  //} catch (err) {
  //console.log(err);
  //return 'something went wring';
  //}
};

module.exports = sendEmail;
