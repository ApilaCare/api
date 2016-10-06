var _ = require('lodash');
var moment = require('moment');

var fs = require('fs');

var START_WORK_DAY = 8;
var END_WORK_DAY = 16;

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

  loadMockTime();

  var tasks = todo.tasks;
  var currTime = moment();

  _.forEach(tasks, function(task) {

      inNewCycle(task);

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

};

//TODO: Monday - Friday??

function inNewCycle(task) {

  //var currTime = moment();
  var currTime = currentTime;
  var cycleDate = moment(task.cycleDate);

  switch(task.occurrence) {

    // Every Hour - task should be active between 8 - 16
    case occurrence.EVERY_HOUR:
        console.log(cycleDate.hour() + "  " + currTime.hour());
        if(currTime.hour() >= START_WORK_DAY &&
                currTime.hour() <= END_WORK_DAY && currTime.hour() !== cycleDate.hour()){

          resetTaskCycle(task);
        }
      break;

    // midnight and moon
    case occurrence.TWICE_DAY:

      break;

    case occurrence.EVERY_DAY:
        if(!currTime.isSame(cycleDate, "day")){
          resetTaskCycle(task);
        }
      break;

    case occurrence.EVERY_OTHER_DAY:

      break;

    case occurrence.TWICE_WEEK:

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

function resetTaskCycle(task) {
  task.current = true;
  task.complete = false;
  task.cycleDate = currentTime;
}


loadMockTime();

function loadMockTime() {
  if(process.env.BACK_TO_FUTURE) {
    fs.readFile("./tools/date.txt", 'UTF8', function(err, data) {
      currentTime = moment(parseInt(data));
      console.log(currentTime.format('MMMM Do YYYY, h:mm:ss a'));

    });
  }

}
