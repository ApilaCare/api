(function() {
  'use strict';

  var nodemailer = require('nodemailer');
  var fs = require('fs');

  var config = {
    "email": process.env.EMAIL,
    "password": process.env.EMAIL_PASSWORD
  };

  var transporter = nodemailer
      .createTransport("smtps://" + config.email + ":" + config.password + "@smtp.gmail.com");


  var mailOptions = {
    from: '',
    to: '',
    subject: '',
    text: '',
    html: ''
};

  module.exports.sendMail = function(from, to, subject, text, callback) {

    mailOptions.from = from;
    mailOptions.to = to;
    mailOptions.subject = subject;
    mailOptions.html = text;

    transporter.sendMail(mailOptions, callback);
  };

  module.exports.sendForgotPassword = function(from, to, token, host, callback) {
    mailOptions.from = from;
    mailOptions.to = to;
    mailOptions.subject = "Password reset for ApilaCare";
    mailOptions.text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://apilatest.herokuapp.com/auth/reset-password/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n';

    transporter.sendMail(mailOptions, callback);
  };

  module.exports.sendConfidentialIssues = function(from, to, recoveredUser, issues, callback) {
    mailOptions.from = from;
    mailOptions.to = to;
    mailOptions.attachments = [
      {
            path: "confidential.pdf"
        },
    ];
    mailOptions.subject = "Recovered confidetial issues for " + recoveredUser;
    mailOptions.text = 'You have recovored condifential issues for member' + recoveredUser + "\n"
               + "In the attachment confidential.pdf you can see all the confidential issues from the user";

    transporter.sendMail(mailOptions, callback);
  };

})();
