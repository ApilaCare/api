const mongoose = require('mongoose');

let ActivitySchema = new mongoose.Schema({
  type: {type: String},
  createdOn: {type: Date, default: Date.now()},
  text: {type: String},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Activity', ActivitySchema);
