const _ = require('lodash');
const moment = require('moment');
require('moment-range');

const fs = require('fs');
const readFile = require('fs-readfile-promise');
const occurrence = require('../../services/constants').occurrence;
const taskState = require('../../services/constants').taskState;

let currentTime = moment();

module.exports.updateTasks = async (todo) => {

  let currTime = await loadMockTime();
  currentTime = currTime; //do we need to do this?

  if(currTime) {

    let tasks = todo.tasks;

    _.forEach(tasks, function(task) {
      updateTask(task, currTime);
    });

    todo.tasks = tasks;

    return todo.save();
  }


};

function updateTask(task, currTime) {

  let cycleDate = moment(task.cycleDate);

  let currHour = currTime.hour();
  let currDay = currTime.isoWeekday();
  let currWeek = weekOfMonth(currTime);
  let currMonth = currentTime.month();

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
  let isInList = _.find(task.notCompleted, (value) => {
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

  return function(cycle) {

    const dayAvailability = hourAvailability(task, currTime, task.startTime, task.endTime);
    const weekAvailability = hourAvailability(task, currTime, task.weekStartTime, task.weekEndTime);

    let weekDaySelected = true;

    if(task.selectDay && (currTime.format("dddd") !== task.selectDay)) {
      weekDaySelected = false;
    }

    let daysInMonthSelected = true;

    if(task.daysInMonth && (currTime.date() !== task.daysInMonth)) {
      daysInMonthSelected = false;
    }

    let selectedWeekDaySelected = true;

    if(task.selectedWeekDay) {
      const parsedWeekDay = task.selectedWeekDay.toString().split('').map(Number);
      let week = parsedWeekDay[0];
      const day = parsedWeekDay[1];

      const weeksInMonth = moment(moment().endOf('month') - moment().startOf('month')).weeks();

      // if the month only has 4 weeks and the users selected fifth week he wanted the last week of month
      if(weeksInMonth === 4 && week === 5) {
        week = 4;
      }

      if(currWeek !== week || currDay !== day) {
        selectedWeekDaySelected = false;
      }

    }

    if(cycle === "hours") {
      return (currHour >= task.hourStart && currHour <= task.hourEnd);
    } else if(cycle === "days") {
      return task.activeDays[currDay - 1] && dayAvailability;
    } else if(cycle === "weeks") {
      return task.activeWeeks[currWeek - 1] && weekAvailability && weekDaySelected;
    } else if(cycle === "months") {
      return task.activeMonths[currMonth] && daysInMonthSelected && selectedWeekDaySelected;
    }
  };

}

//check interval availability for an hourly range
function hourAvailability(task, currTime, startTime, endTime) {
  if(startTime && endTime) {
    
    const startHours = parseInt(moment(startTime).format('Hmm'));
    const endHours = parseInt(moment(endTime).format('Hmm'));
    const currHours = parseInt(moment(currTime).format('Hmm'));

    if(currHours <= startHours || currHours >= endHours) {
      return false;
    }
  }

  return true;
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

async function loadMockTime() {
  if(process.env.BACK_TO_FUTURE) {

    try {
      const mockupTime = await readFile("./tools/date.txt", 'UTF8');

      return moment(parseInt(mockupTime));

    } catch (err) {
      console.log(err);
      return moment();
    }

  } else {
    return moment();
  }

}

module.exports.loadMockTime = loadMockTime;
