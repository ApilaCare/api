
const nodemailer = require('nodemailer');
const fs = require('fs');
const sgTransport = require('nodemailer-sendgrid-transport');

const config = {
  "email": process.env.EMAIL,
  "password": process.env.EMAIL_PASSWORD
};

const sendgridConfig = {
  auth: {
        api_key: process.env.SENDGRID_API
    }
};

const transporter = nodemailer.createTransport(sgTransport(sendgridConfig));

let mailOptions = {
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

  let resetUrl = "https://apilatest.herokuapp.com/auth/reset-password/";

  if(process.env.NODE_ENV === 'production') {
    resetUrl = "https://apila.care/auth/reset-password/";
  } else if(process.env.NODE_ENV === 'staging') {
    resetUrl = "https://apila.us/auth/reset-password/";
  }

  mailOptions.from = from;
  mailOptions.to = to;
  mailOptions.subject = "Password reset for Apila";
  mailOptions.text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        resetUrl + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n';

  transporter.sendMail(mailOptions, callback);
};

module.exports.sendVerificationEmail = function(from, to, token) {

  mailOptions.from = from;
  mailOptions.to = to;

  var link = "https://apilatest.herokuapp.com/auth/verify/" + token;

  if(process.env.NODE_ENV === 'production') {
    link = "https://apila.care/auth/verify/" + token;
  } else if(process.env.NODE_ENV === 'staging') {
    link = "https://apila.us/auth/verify/" + token;
  } else if(process.env.NODE_ENV === 'development') {
    link = "http://localhost:3000/auth/verify/" + token;
  }

  mailOptions.subject = "Verify email to use Apila";
  mailOptions.text = "Thanks for registering with Apila, to create your own communities" +
  " and continue to use the service please confirm your email by going to the following link: " + link;

  return transporter.sendMail(mailOptions);

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
  mailOptions.text = 'You have recovered confidential issues for member' + recoveredUser + "\n" +
              "In the attachment confidential.pdf you can see all the confidential issues from the user";

  transporter.sendMail(mailOptions, callback);
};
