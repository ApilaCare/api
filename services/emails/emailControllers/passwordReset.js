const passwordReset = require('./../emailTemplates/passwordReset');

const transporter = require('./email').transporter;

module.exports.sendForgotPassword = (from, to, token, username) => {

  let mailOptions = {};

  let resetUrl = "https://apilatest.herokuapp.com/auth/reset-password/";

  if(process.env.NODE_ENV === 'production') {
    resetUrl = "https://apila.care/auth/reset-password/";
  } else if(process.env.NODE_ENV === 'staging') {
    resetUrl = "https://apila.us/auth/reset-password/";
  } else if(process.env.NODE_ENV === 'development') {
    resetUrl = "http://localhost:3000//auth/reset-password/";
  }

  mailOptions.from = from;
  mailOptions.to = to;
  mailOptions.subject = "Password Reset for Apila";

  const link = resetUrl + token;

  mailOptions.html = passwordReset(link, username);


  // mailOptions.text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
  //       'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
  //       resetUrl + token + '\n\n' +
  //       'If you did not request this, please ignore this email and your password will remain unchanged.\n';

  return transporter.sendMail(mailOptions);
};
