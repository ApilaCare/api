const verifyEmail = require('./../emailTemplates/verifyEmail');

const transporter = require('./email').transporter;

module.exports.sendVerificationEmail = (from, to, token, username) => {

  let mailOptions = {};



  mailOptions.from = from;
  mailOptions.to = to;

  let link = "https://apilatest.herokuapp.com/auth/verify/" + token;

  if(process.env.NODE_ENV === 'production') {
    link = "https://apila.care/auth/verify/" + token;
  } else if(process.env.NODE_ENV === 'staging') {
    link = "https://apila.us/auth/verify/" + token;
  } else if(process.env.NODE_ENV === 'development') {
    link = "http://localhost:3000/auth/verify/" + token;
  }

  mailOptions.subject = "Verify Your Email";
  mailOptions.html = verifyEmail(link, username);

  return transporter.sendMail(mailOptions);

};
