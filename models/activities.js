const mongoose = require('mongoose');

let ActivitySchema = new mongoose.Schema({
  author: {type: String},
  type: {type: String},
  createdOn: {type: Date, default: Date.now()},
  text: {type: String}
});

mongoose.model('Activity', ActivitySchema);
