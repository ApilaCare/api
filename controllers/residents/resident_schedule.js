var mongoose = require('mongoose');
var schedule = require('node-schedule');

var Resid = mongoose.model('Resident');

var exportResidentService = require('./../../services/exports/intervalCarePlans');

var WEEKLY = 0, MONTHLY = 1, QUARTELY = 2, YEARLY = 3;

//Go through each resident and based of their assessmentInterval export care plan
//and uploaded to aws s3

(function scheduleExportJob() {
  Resid.find({}, function(err, residents) {
    if(err) {
      console.log("Error while finding resident");
    } else {

      //exportResidentService.exportCarePlan(residents[0]);

      for (var i = 0; i < residents.length; ++i) {

        var scheduleInterval = residents[i].assessmentInterval;

        //console.log(scheduleInterval);

        setScheduleInterval(scheduleInterval, residents[i]);

      }
    }
  });
})();

function setScheduleInterval(scheduleInterval, resident) {
  if(scheduleInterval) {
    if(scheduleInterval === WEEKLY) {
      callScheduleJob("day", 7, resident);
    } else if (scheduleInterval === MONTHLY) {
      callScheduleJob("day", 31, resident);
    }  else if (scheduleInterval === QUARTELY) {
      callScheduleJob("day", 365/4, resident);
    }  else if (scheduleInterval === YEARLY) {
      callScheduleJob("day", 365, resident);
    }
  }
}

function callScheduleJob(type, value, resident) {
  schedule.scheduleJob(createRule(type, value), function() {
    exportCarePlan(resident);
  });
}

function createRule(type, value) {
  var rule = new schedule.RecurrenceRule();
  rule[type] = 1;

  return rule;
}

function exportCarePlan(resident) {
  //console.log("Hello there the export is called");
}
