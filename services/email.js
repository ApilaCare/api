(function() {
  'use strict';

  var nodemailer = require('nodemailer');

  var config = {
    "email": process.env.EMAIL,
    "password": process.env.EMAIL_PASSWORD
  };

  var transporter = nodemailer
                .createTransport("smtps://" + config.email + ":" + config.password + "@smtp.gmail.com");


  var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: 'nesa993@gmail.com', // list of receivers
    subject: 'Hello', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world</b>' // html body
};

  module.exports.sendMail = function() {
    transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);
      });
  }

})();
