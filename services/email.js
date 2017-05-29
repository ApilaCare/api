
const nodemailer = require('nodemailer');
const fs = require('fs');
const sgTransport = require('nodemailer-sendgrid-transport');
const verifyEmail = require('./emailTemplates/verifyEmail');

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
