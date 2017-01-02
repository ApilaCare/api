const mongoose = require('mongoose');

let ActivitySchema = new mongoose.Schema({
  scope: {type: String, enum: ['community', 'user']},
  type: {type: String},
  createdOn: {type: Date, default: Date.now()},
  text: {type: String},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // user who created the activity
  responsibleUser: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //the user who is mentioned in the activity
  communityId: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'}
});

mongoose.model('Activity', ActivitySchema);
