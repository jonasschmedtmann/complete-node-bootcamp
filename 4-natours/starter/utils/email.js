const nodemailer = require('nodemailer');

const sendEmail = async option => {
  // CRREATE A TRNSPORTER..
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "5a64213903a459",
      pass: "9501fec9e11b1f"
    }
  });

  // DEFINE THE EMAIL.. 

  const mailOption = {
    from: 'Soumya <soumyasubhrajit@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message
  }

  // SEND THE EMAIL..
  try {
    await transport.sendMail(mailOption);
    console.log("The email has been sent!");
  } catch (error) {
    console.error(error);
  }
}

// this is the cause that you have made this so far..
module.exports = sendEmail;