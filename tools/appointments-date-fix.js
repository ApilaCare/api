// to run script on heroku:
// heroku run node ./app_api/tools/appointments-date-fix.js --app apilatest

require('../models/db');

const mongoose = require('mongoose');
const Appoint = mongoose.model('Appointment');

const moment = require('moment');

const asyncLib = require('async');

(() => {
  Appoint.find({}).exec(function(err, appointments) {
    if(!err) {

      console.log("started updating appointments");

      asyncLib.each(appointments, function(appointment) {
        appointment.currMonth = moment(appointment.appointmentDate).format("YYYY M");

       appointment.save();
      });

      console.log("appointments updated");

    } else {
      console.log("Error while finding appointments");
    }
  });
})();
