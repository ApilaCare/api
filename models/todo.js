var mongoose = require('mongoose');

var todoItemSchema = new mongoose.Schema({

  text: {type: String, required: true},
  complete: {type: Boolean, required: true, default: false},
  current: {type: Boolean, default: true}, // if the task is currently ongoing
  cycleDate : {type: Date, default: Date.now},
  occurrence: {type: Number, required: true},

  // automatic
  completeOn: {type: Date},
  createdOn: {type: Date, default: Date.now},

  completed: [counterSchema], // completed before certain amount of time
  overDue: [counterSchema], // not completed
  notCompleted: [counterSchema],
});

var counterSchema = new mongoose.Schema({
  count: {type: Number, required: true, default: 0},
  updatedOn: {type: Date, default: Date.now}
});

var todoSchema = new mongoose.Schema({

  tasks: [todoItemSchema]

});

// scale of 1-13 | 1 = every hour,
//                 2 = twice a day,
//                 3 = every day,
//                 4 = every other day,
//                 5 = twice a week,
//                 6 = every week,
//                 7 = every two weeks,
//                 8 = twice a month,
//                 9 = every month,
//                 10 = every two months,
//                 11 = every quarter,
//                 12 = twice a year,
//                 13 = every year,

// visual representation of the counters:
//
//    item                            becomes "not completed";
//    posted         becomes          item posted
//    to do          "overdue"        to do again
//      |---------------|---------------|
//     |---------time interval---------|

mongoose.model('ToDo', todoSchema);
