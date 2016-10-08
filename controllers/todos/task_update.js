var _ = require('lodash');
var moment = require('moment');

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
  "EVERY_HOUR" : 0,
  "TWICE_DAY" : 1,
  "EVERY_DAY" : 2,
  "EVERY_OTHER_DAY" : 3,
  "TWICE_WEEK" : 4,
  "EVERY_WEEK" : 5,
  "EVERY_TWO_WEEKS" : 6,
  "TWICE_MONTH" : 7,
  "EVERY_MONTH" : 8,
  "EVERY_TWO_MONTHS" : 9,
  "EVERY_QUATER" : 10,
  "TWICE_YEAR" : 11,
  "EVERY_YEAR" : 12,
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

          // if(task.occurrence === occurrence.EVERY_DAY) {
          //   //if it's past 12 pm it's overdue
          //   if(currTime.hour() >= 12) {
          //     console.log('overdue');
          //     //if we are already have overdue for this cycle dont push it
          //     task.overDue.push({"counter" : 0, updatedOn: new Date()});
          //   }
          // }



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

//TODO: Monday - Friday??

function inNewCycle(task, currTime) {

  //var currTime = moment();
  var cycleDate = moment(task.cycleDate);
  var currHour = currTime.hour();
  var currDay = currTime.isoWeekday();
  //console.log("Current time: " + currTime.format('MMMM Do YYYY, h:mm:ss a'));

  switch(task.occurrence) {

    // Every Hour - task should be active between 8 - 16
    case occurrence.EVERY_HOUR:
        console.log(cycleDate.hour() + "  " + currHour);
        if(isInWorkHours(currHour) && currHour !== cycleDate.hour()){

          resetTaskCycle(task);
        }

        if(!isInWorkWeek(currDay) || !isInWorkHours(currHour)) {
          hideTask(task);
        } else {
          showTask(task);
        }

      break;

    // midnight and noon (2 cycles a day)
    case occurrence.TWICE_DAY:

        // if we are in a next day reset
        if(!currTime.isSame(cycleDate, "day")){
          resetTaskCycle(task);
        }
        // if we last check in the first cycle but now it's time for the second one
        else if(cycleDate.hour() < 12 && currHour >= 12) {
          resetTaskCycle(task);
        }

        if(!isInWorkWeek(currDay)) {
          hideTask(task);
        } else {
          showTask(task);
        }
      break;

    case occurrence.EVERY_DAY:
        if(!currTime.isSame(cycleDate, "day")){
          resetTaskCycle(task);
        }

        if(!isInWorkWeek(currDay)) {
          hideTask(task);
        } else {
          showTask(task);
        }
      break;

    // Monday, Wednesday, Friday
    case occurrence.EVERY_OTHER_DAY:

    if(!currTime.isSame(cycleDate, "day")){
      if(currDay === day.MONDAY || currDay === day.WEDNESDAY || currDay === day.FRIDAY) {
        resetTaskCycle(task);
      }
    }

    if(currDay !== day.MONDAY || currDay !== day.WEDNESDAY || currDay !== day.FRIDAY) {
      hideTask(task);
    } else {
      showTask(task);
    }
      break;

    // Tuesday, Thursday
    case occurrence.TWICE_WEEK:

        if(!currTime.isSame(cycleDate, "day")){
          if(currDay === day.TUESDAY || currDay === day.THURSDAY) {
            resetTaskCycle(task);
          }
        }

        if(currDay !== day.TUESDAY || currDay !== day.THURSDAY) {
          hideTask(task);
        } else {
          showTask(task);
        }
      break;

    case occurrence.EVERY_WEEK:

      break;

    case occurrence.EVERY_TWO_WEEKS:

      break;

    case occurrence.TWICE_MONTH:

      break;

    case occurrence.EVERY_MONTH:

      break;

    case occurrence.EVERY_TWO_MONTHS:

      break;

    case occurrence.EVERY_QUATER:

      break;

    case occurrence.TWICE_YEAR:

      break;

    case occurrence.EVERY_YEAR:

      break;

  }
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
  console.log("HOUR: " + currHour);
  if(currHour >= START_WORK_DAY && currHour <= END_WORK_DAY) {
    return true;
  } else {
    return false;
  }
}

function isInWorkWeek(currDay) {
  console.log("DAY: " + currDay);
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
      console.log(currentTime.format('MMMM Do YYYY, h:mm:ss a'));
      callback(currentTime);
    });
  } else {
    callback(null);
  }

}
