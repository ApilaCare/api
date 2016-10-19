var _ = require('lodash');
var moment = require('moment');
require('moment-range');

var fs = require('fs');
const constants = require('../../services/constants');

var currentTime = moment();


//if the task is current = true, show it in the current list of todoSchema
// when we set overudue/notcomplete we set current = false

// when a new day(cycle) rolls up we set current = true, so we need to remember
// on what cycle (date) we are

module.exports.updateTasks = function(todo, callback) {

  loadMockTime(function(currTime) {
    if(currTime) {

      var tasks = todo.tasks;

      _.forEach(tasks, function(task) {
        inNewCycle(task, currTime);
      });

      todo.tasks = tasks;

      todo.save(function(err) {
        if(err) {
          callback(false, err);
        } else {
          callback(true, err);
        }});
    }
  });

};

function inNewCycle(task, currTime) {

  var cycleDate = moment(task.cycleDate);

  var currHour = currTime.hour();
  var currDay = currTime.isoWeekday();
  var currWeek = weekOfMonth(currTime);
  var currMonth = currentTime.month();

  var unchangedTask = JSON.parse(JSON.stringify(task));

  switch(task.occurrence) {

    // Every Hour
    case constants.occurrence.HOURLY:

        if(isInWorkHours(task, currHour) && currHour !== cycleDate.hour()){

          resetTaskCycle(task);
        }

        if(!isInWorkWeek(currDay) || !isInWorkHours(task, currHour)) {
          hideTask(task);
        } else {
          showTask(task);
        }


      break;

    case constants.occurrence.DAILY:

        //we are at some future cycle and task isn't completed
        if(!currTime.isSame(cycleDate, "day") && isInActiveDays(task.activeDays, currDay)) {
          if(task.state !== "complete" || task.state !== "overdue") {
            var sinceLastUpdate = moment.range(cycleDate, currentTime);

            sinceLastUpdate.by('days', function(day) {
              if(isInActiveDays(task.activeDays, day.isoWeekday())) {

                if(!isInNotCompleted(task, currTime)) {
                  task.notCompleted.push({updatedOn: day.toDate()});
                }
              }

            });
          }
        }

        if(!currTime.isSame(cycleDate, "day") && isInActiveDays(task.activeDays, currDay)){
          console.log("Cycled reset");
          resetTaskCycle(task);
        }

        if(!isInActiveDays(task.activeDays, currDay)) {
          console.log("Hide tasks");
          hideTask(task);
        } else {
          console.log("Show tasks");
          showTask(task);
        }

        task.cycleDate = currentTime;

      break;

    case constants.occurrence.WEEKLY:

        if(!currTime.isSame(cycleDate, "week") && isInActiveWeeks(task.activeWeeks, currWeek)){
          resetTaskCycle(task);
        }

        if(!isInActiveWeeks(task.activeWeeks, currWeek)) {
          hideTask(task);
        } else {
          showTask(task);
        }

        //if the current week is up and the task is not inactive

      break;

    case constants.occurrence.MONTHLY:
        if(!currTime.isSame(cycleDate, "month") && isInActiveMonths(task.activeMonths, currMonth)){
          resetTaskCycle(task);
        }

        if(!isInActiveMonths(task.activeMonths, currMonth)) {
          hideTask(task);
        } else {
          showTask(task);
        }
      break;

  }
}

function isInNotCompleted(task, day) {
  var isInList = _.find(task.notCompleted, function(value) {
      if(moment(value.updatedOn).isSame(day, "day")) {
        return true;
      } else {
        return false;
      }
    });

  return isInList ? true: false;
}

// Checks if the current day is an 'active' (where task can be done) day
// activeDays represent a week of days true being that day is set
// currDay a value from 1 - 7, 1 being Monday, 7 being Sunday
function isInActiveDays(activeDays, currDay) {
  return activeDays[currDay - 1];
}

function isInActiveMonths(activeMonths, currMonth) {
  return activeMonths[currMonth];
}

function isInActiveWeeks(activeWeeks, currWeek) {
  return activeWeeks[currWeek - 1];
}

function weekOfMonth(m) {
  return m.week() - moment(m).startOf('month').week() + 1;
}

function hideTask(task) {
  task.state = "inactive";
}

function showTask(task) {
  if(task.state !== 'complete') {
    task.state = 'current';
  }
}

function resetTaskCycle(task) {
  task.state = "current";
  task.cycleDate = new Date();
}

//checks if we are in the work hours standard shift
function isInWorkHours(task, currHour) {
  if(currHour >= task.hourStart && currHour <= task.hourEnd) {
    return true;
  } else {
    return false;
  }
}

function isInWorkWeek(currDay) {
  if(currDay === constants.day.SATURDAY || currDay === constants.day.SUNDAY) {
    return false;
  } else {
    return true;
  }
}

function loadMockTime(callback) {
  if(process.env.BACK_TO_FUTURE) {
    fs.readFile("./tools/date.txt", 'UTF8', function(err, data) {
      currentTime = moment(parseInt(data));
      callback(currentTime);
    });
  } else {
    callback(moment());
  }

}

module.exports.loadMockTime = loadMockTime;
