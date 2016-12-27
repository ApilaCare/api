var mongoose = require('mongoose');

var chatSchema = new mongoose.Schema({
  message: {type: String, required: true},
  userSend: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  userReceived: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  community: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
  timeSent: {type: Date, default: Date.now()}
});

mongoose.model('Chat', chatSchema);
