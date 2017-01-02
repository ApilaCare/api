const _ = require('lodash');
const moment = require('moment');
require('moment-range');

const fs = require('fs');
const occurrence = require('../../services/constants').occurrence;
const taskState = require('../../services/constants').taskState;

var currentTime = moment();

module.exports.updateTasks = function(todo, callback) {

  loadMockTime((currTime) => {
    if(currTime) {

      var tasks = todo.tasks;

      _.forEach(tasks, function(task) {
        updateTask(task, currTime);
      });

      todo.tasks = tasks;

      todo.save((err) => {
        if(err) {
          callback(false, err);
        } else {
          callback(true, err);
        }});
    }
  });

};

function updateTask(task, currTime) {

  var cycleDate = moment(task.cycleDate);

  var currHour = currTime.hour();
  var currDay = currTime.isoWeekday();
  var currWeek = weekOfMonth(currTime);
  var currMonth = currentTime.month();

  var unchangedTask = JSON.parse(JSON.stringify(task));

  let inCycle = isInActiveCycle(task, currTime);

  switch(task.occurrence) {

    // Every Hour
    case occurrence.HOURLY:

        checkIfCompleted(task, currTime, cycleDate, "hours");

        if(inCycle("hours") && currHour !== cycleDate.hour()){

          resetTaskCycle(task);
        }

        let notInActiveCycle = (!inCycle("days") || !inCycle("hours"));
        toggleTask(task, notInActiveCycle);

      break;

    case occurrence.DAILY:

        checkIfCompleted(task, currTime, cycleDate, "days");

        if(!currTime.isSame(cycleDate, "day") && inCycle("days")){
          resetTaskCycle(task);
        }

        toggleTask(task, !inCycle("days"));

      break;

    case occurrence.WEEKLY:

        checkIfCompleted(task, currTime, cycleDate, "weeks");

        if(!currTime.isSame(cycleDate, "week") && inCycle("weeks")){
          resetTaskCycle(task);
        }

        toggleTask(task, !inCycle("weeks"));

      break;

    case occurrence.MONTHLY:

        checkIfCompleted(task, currTime, cycleDate, "months");

        if(!currTime.isSame(cycleDate, "month") && inCycle("months")){
          resetTaskCycle(task);
        }

        toggleTask(task, !inCycle("months"));

      break;

  }

  task.cycleDate = currentTime;
}

function checkIfCompleted(task, currTime, cycleDate, cycle) {

  let cycleWithoutS = cycle.slice(0, -1);
  let currTimeCycle = isInActiveCycle(task, currTime);
  let sinceLastUpdate = moment.range(cycleDate, currentTime);

  if(!currTime.isSame(cycleDate, cycleWithoutS) && task.state !== taskState.COMPLETE && currTimeCycle(cycle)) {

    sinceLastUpdate.by(cycle, (currCycle) => {

      let inCycle = isInActiveCycle(task, currCycle);
      if(inCycle(cycle)) {

        if(task.occurrence !== occurrence.HOURLY) {
          if(!isInNotCompleted(task, currTime) && !currTime.isSame(currCycle, cycleWithoutS)) {
            task.notCompleted.push({updatedOn: currCycle.toDate()});
          }
        } else {
          if(!currTime.isSame(currCycle, cycleWithoutS)) {
            task.notCompleted.push({updatedOn: currCycle.toDate()});
          }
        }

      }

    });

  }
}

function isInNotCompleted(task, day) {
  var isInList = _.find(task.notCompleted, (value) => {
      if(moment(value.updatedOn).isSame(day, "day")) {
        return true;
      } else {
        return false;
      }
    });

  return isInList ? true: false;
}

function weekOfMonth(m) {
  return m.week() - moment(m).startOf('month').week() + 1;
}

function isInActiveCycle(task, currTime) {

  let currHour = currTime.hour();
  let currDay = currTime.isoWeekday();
  let currWeek = weekOfMonth(currTime);
  let currMonth = currentTime.month();

  return function(cycle){
    if(cycle === "hours") {
      return (currHour >= task.hourStart && currHour <= task.hourEnd);
    } else if(cycle === "days") {
      return task.activeDays[currDay - 1];
    } else if(cycle === "weeks") {
      return task.activeWeeks[currWeek - 1];
    } else if(cycle === "months") {
      return task.activeMonths[currMonth];
    }
  };

}

function toggleTask(task, taskNotActive) {
  if(taskNotActive === true) {
    task.state = taskState.INACTIVE;
  } else {
    if(task.state !== taskState.COMPLETE) {
      task.state = taskState.CURRENT;
    }
  }
}


function resetTaskCycle(task) {
  task.state = taskState.CURRENT;
  task.cycleDate = new Date();
}

function loadMockTime(callback) {
  if(process.env.BACK_TO_FUTURE) {
    fs.readFile("./tools/date.txt", 'UTF8', (err, data) => {
      currentTime = moment(parseInt(data));
      callback(currentTime);
    });
  } else {
    callback(moment());
  }

}

module.exports.loadMockTime = loadMockTime;
