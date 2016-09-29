var mongoose = require('mongoose');

var todoItemSchema = new mongoose.Schema({

  text: {type: String, required: true},
  complete: {type: Boolean, required: true, default: false},
  occurrence: {type: Number, required: true}, // scale of 1-13 | 1 = every hour,
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

  // automatic
  completeOn: {type: Date},
  createdOn: {type: Date, default: Date.now}
  itemId: {type: Number, required: true},  // maybe have this create a ObjectId("xyz") for the subdocument
});

var counterSchema = new mongoose.Schema({
  count: {type: Number, required: true, default: 0},
  counterItemId: {type: Number, required: true}, // itemId from todoItemSchema
});

var todoSchema = new mongoose.Schema({

  todoItem: [todoItemSchema],

  // visual representation of the counters:
  //
  //    item                            becomes "not completed";
  //    posted         becomes          item posted
  //    to do          "overdue"        to do again
  //      |---------------|---------------|
  //      |---------time interval---------|

  // counters
  completed: [counterSchema], // completed before certain amount of time
  overDue: [counterSchema], // not completed
  notCompleted: [counterSchema],

  // automatic
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // have each todo tied to a user;
                                                                  // probably automatically create a new document
                                                                  // when a user registers
});

mongoose.model('To-Do', todoSchema);
