const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  updatedOn: {type: Date, default: Date.now}
});

const todoItemSchema = new mongoose.Schema({

  text: {type: String, required: true},
  cycleDate : {type: Date, default: Date.now},
  occurrence: {type: Number, required: true},
  state: {type: String, required: true}, //it can be: complete | current | inactive
  issueName: {type: String},

  activeDays: [{type: Boolean}], //if user selected specific days
  activeWeeks: [{type: Boolean}],
  activeMonths: [{type: Boolean}],

  everyMonth: {type: Boolean},
  everyWeek: {type: Boolean},
  hourStart: {type: Number, default: 0},
  hourEnd: {type: Number, default: 23},

  //availability interval
  startTime: {type: String},
  endTime: {type: String},
  weekStartTime: {type: String},
  weekEndTime: {type: String},
  selectDay: {type: String},
  daysInMonth: {type: Number},
  selectedWeekDay: {type: Number},

  // automatic
  completeOn: {type: Date},
  createdOn: {type: Date, default: Date.now},

  completed: [counterSchema], // completed before certain amount of time
  notCompleted: [counterSchema],
});

const todoSchema = new mongoose.Schema({

  tasks: [todoItemSchema]

});


// visual representation of the counters:
//
//    item                            becomes "not completed";
//    posted         becomes          item posted
//      |---------------|---------------|
//     |---------time interval---------|

mongoose.model('ToDo', todoSchema);
