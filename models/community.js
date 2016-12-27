var mongoose = require('mongoose');

var chatSchema = new mongoose.Schema({
  message: {type: String, required: true},
  userSend: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  userReceived: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  community: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
  timeSent: {type: Date, default: Date.now()}
});

var roomStyleSchema = new mongoose.Schema({
    name: {type: String, required: true},
    area: {type: Number},
    areaUnit: {type: Boolean, default: true}, // if true: feet^2 | if false: meter^2
    rooms: [String],

    submitOn: {type: Date, "default": Date.now},
    submitBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

var communitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    communityMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    pendingMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    boss: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    directors: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    minions: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    testCommunity: {type: Boolean, default: false},

    website: {type: String},
    phone: {type: String},
    address: {type: String},
    town: {type: String},
    logo: {type: String},
    fax: {type: String},
    numFloors: {type: Number},
    floors: [{
      floorNumber: {type: Number},
      startRoom: {type: String},
      endRoom: {type: String}
    }],
    rooms: {type: Number},
    roomStyle: [roomStyleSchema],
    communityChat: [chatSchema]
});

mongoose.model('Community', communitySchema);
