const mongoose = require('mongoose');
const schedule = require('node-schedule');
const Iss = mongoose.model('Issue');
const moment = require('moment');

// constants time in minutes
const DAY = 24 * 60;
const THREE_DAYS = 72 * 60;
const THREE_WEEKS = 504 * 60;
const THREE_MONTHS = 2160 * 60;

let rule = new schedule.RecurrenceRule();
rule.hour = 1;

//checks each hour if any of the issues are 'experied'
//need to change status after some time has passed
schedule.scheduleJob(rule, () => {

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


const everyDayRule = new schedule.RecurrenceRule();

//just for testing
everyDayRule.minute = 1;

// schedule.scheduleJob(" */5 * * * *", async () => {

//   let users = {};

//   const allIssues = await Iss.find({}).exec();

//   allIssues.forEach((issue) => {
//     const activeIssue = isIssueActive(issue);

//     trackUserActivity(users, issue, activeIssue);
//   });

//   console.log(users);

 
// });

function trackUserActivity(users, issue, activeIssue) {
  if(!users[issue.responsibleParty]) {
    users[issue.responsibleParty] = {inactiveIssues: 0, activeIssues: 0};
  }

  if(activeIssue) {
    users[issue.responsibleParty].activeIssues++;
  } else {
    users[issue.responsibleParty].inactiveIssues++;
  }

}

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

function isIssueActive(issue) {

    let lastDate = "";

    if(issue.updateInfo.length > 0) {
      lastDate = issue.updateInfo[issue.updateInfo.length - 1].updateDate;
    } else {
      lastDate = issue.submitDate;
    }

    switch(issue.resolutionTimeframe) {
      case "Hours":
        return checkDateOffset(issue, lastDate, 'hours');
      break;

      case "Days":
        return checkDateOffset(issue, lastDate, 'days');
      break;

      case "Weeks":
        return checkDateOffset(issue, lastDate, 'weeks');
      break;

      case "Months":
        return checkDateOffset(issue, lastDate, 'months');
      break;

    }
    
}

function checkDateOffset(issue, lastDate, timeUnit) {
  const offsetDate = moment(lastDate).add(1, timeUnit);

  if(moment().isAfter(offsetDate)) {
    return true;
  }

  return false;

}