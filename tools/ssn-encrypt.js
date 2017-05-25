// to run script on heroku:
// heroku run node ./app_api/tools/ssn-encrypt.js --app apilatest

require('../models/db');

const cryptoHelper = require('../services/crypto_helper');

const mongoose = require('mongoose');
const Resid = mongoose.model('Resident');

const moment = require('moment');

const asyncLib = require('async');

(() => {
  Resid.find({community: '583b1dcf4f3ab50400c3e00a'}).exec(function(err, residents) {
    if(!err) {

      console.log("started updating residents");

      asyncLib.each(residents, function(resident) {

        if(resident.socialSecurityNumber) {
            resident.socialSecurityNumber = cryptoHelper.encrypt(resident.socialSecurityNumber);

            resident.save();
        }
      });

      console.log("residents updated");

    } else {
      console.log("Error while finding residents");
    }
  });
})();
