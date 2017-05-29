const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const sendgridConfig = {
  auth: {
        api_key: process.env.SENDGRID_API
    }
};

const transporter = nodemailer.createTransport(sgTransport(sendgridConfig));

module.exports.transporter = transporter;
