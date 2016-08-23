var mongoose = require('mongoose');
var schedule = require('node-schedule');
var Iss = mongoose.model('Issue');

// constants time in minutes
var DAY = 24 * 60;
var THREE_DAYS = 72 * 60;
var THREE_WEEKS = 504 * 60;
var THREE_MONTHS = 2160 * 60;

var rule = new schedule.RecurrenceRule();
rule.hour = 1;

//checks each hour if any of the issues are 'experied'
//need to change status after some time has passed
schedule.scheduleJob(rule, function() {

  // get all shelved issues
  Iss.find({
    status: "Shelved"
  }, function(err, issues) {
    if (issues) {
      var currTime = new Date();

      // for each issue check if it has expiered back to Open
      for (var i = 0; i < issues.length; ++i) {

        if (issues[i].shelvedDate) {
          var shelvedTime = new Date(issues[i].shelvedDate);

          var timeDiffInMin = (currTime.getTime() - shelvedTime.getTime()) / 60 / 1000;

          if (issues[i].resolutionTimeframe === "Hours" && timeDiffInMin >= DAY) {
            changeIssueStatus(issues[i]._id);
          } else if (issues[i].resolutionTimeframe === "Days" && timeDiffInMin >= THREE_DAYS) {
            changeIssueStatus(issues[i]._id);
          } else if (issues[i].resolutionTimeframe === "Weeks" && timeDiffInMin >= THREE_WEEKS) {
            changeIssueStatus(issues[i]._id);
          } else if (issues[i].resolutionTimeframe === "Months" && timeDiffInMin >= THREE_MONTHS) {
            changeIssueStatus(issues[i]._id);
          }

        }
      }

    } else {
      console.log("Issues not found while updatin shelved issues");
    }
  });

});

//given an issues Id it changes its status to Open
function changeIssueStatus(id) {
  Iss.findById(id).exec(function(err, issue) {
    if (issue) {
      issue.status = "Open";
      issue.save();
    } else {
      console.log("issue not found");
    }
  });
}
