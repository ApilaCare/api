const passwordReset = require('./emailTemplates/passwordReset');

module.exports.sendForgotPassword = function(from, to, token, host, callback) {

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
  mailOptions.text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        resetUrl + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n';

  transporter.sendMail(mailOptions, callback);
};
