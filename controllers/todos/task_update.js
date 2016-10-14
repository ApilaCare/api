var _ = require('lodash');
var moment = require('moment');
require('moment-range');

var fs = require('fs');

var START_WORK_DAY = 8;
var END_WORK_DAY = 16;

var day = {
  "MONDAY" : 1,
  "TUESDAY" : 2,
  "WEDNESDAY" : 3,
  "THURSDAY"  :4,
  "FRIDAY": 5,
  "SATURDAY" : 6,
  "SUNDAY" : 7

};

var currentTime = moment();

var occurrence = {
  "HOURLY": 0,
  "DAILY": 1,
  "WEEKLY": 2,
  "MONTHLY": 3
};


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

  switch(task.occurrence) {

    // Every Hour
    case occurrence.HOURLY:

        if(isInWorkHours(currHour) && currHour !== cycleDate.hour()){

          resetTaskCycle(task);
        }

        if(!isInWorkWeek(currDay) || !isInWorkHours(currHour)) {
          hideTask(task);
        } else {
          showTask(task);
        }

      break;

    case occurrence.DAILY:
        if(!currTime.isSame(cycleDate, "day") && isInActiveDays(task.activeDays, currDay)){
          resetTaskCycle(task);
        }

        if(!isInActiveDays(task.activeDays, currDay)) {
          hideTask(task);
        } else {
          showTask(task);
        }

        //we are at some future cycle and task isn't completed
        if(!currTime.isSame(cycleDate, "day") && !task.complete && isInActiveDays(task.activeDays, currDay)) {

          var sinceLastUpdate = moment.range(cycleDate, currentTime);

          sinceLastUpdate.by('days', function(day) {
            if(isInActiveDays(task.activeDays, day.isoWeekday())) {
              task.notCompleted.push({count: 0, updatedOn: day.toDate()});
            }
          });

          task.cycleDate = currentTime;
        }

        //overdue cycle
        if(currTime.isSame(cycleDate, "day") && currHour > 12) {
            if(!task.overdue) {
              task.overdue = true;

              task.overDue.push({count: 0, updatedOn: currentTime.toDate()});
              task.cycleDate = currentTime;
            }

        }

      break;

    case occurrence.WEEKLY:

      break;

    case occurrence.MONTHLY:

      break;

  }
}

// Checks if the current day is an 'active' (where task can be done) day
// activeDays represent a week of days true being that day is set
// currDay a value from 1 - 7, 1 being Monday, 7 being Sunday
function isInActiveDays(activeDays, currDay) {
  return activeDays[currDay - 1];
}

function hideTask(task) {
  task.current = false;
}

function showTask(task) {
  if(!task.complete) {
    task.current = true;
  }
}

function resetTaskCycle(task) {
  task.current = true;
  task.complete = false;
  task.cycleDate = new Date();
}

//checks if we are in the work hours standard shift
function isInWorkHours(currHour) {
  if(currHour >= START_WORK_DAY && currHour <= END_WORK_DAY) {
    return true;
  } else {
    return false;
  }
}

function isInWorkWeek(currDay) {
  if(currDay === day.SATURDAY || currDay === day.SUNDAY) {
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
