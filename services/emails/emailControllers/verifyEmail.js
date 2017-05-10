const verifyEmail = require('./emailTemplates/verifyEmail');

module.exports.sendVerificationEmail = function(from, to, token) {

  mailOptions.from = from;
  mailOptions.to = to;

  var link = "https://apilatest.herokuapp.com/auth/verify/" + token;
  var username; // username of the person who is verifing their email

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
