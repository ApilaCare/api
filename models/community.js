const mongoose = require('mongoose');

const issueLabelsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    color: {type: String, required: true},
});

const chatSchema = new mongoose.Schema({
  message: {type: String, required: true},
  userSend: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  userReceived: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  community: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
  timeSent: {type: Date, default: Date.now()}
});

const roomStyleSchema = new mongoose.Schema({
    name: {type: String, required: true},
    area: {type: Number},
    rooms: [String],

    submitOn: {type: Date, default: Date.now},
    submitBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const logsSchema = new mongoose.Schema({
  ipAddress: {type: String},
  loggedOn: {type: Date, default: Date.now},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const communitySchema = new mongoose.Schema({
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

    areaUnit: {type: String, default: 'Meters'},
    tempUnit: {type: String, default: 'Celsius'},
    weightUnit: {type: String, default: 'Kilograms'},

    numFloors: {type: Number},
    labels: [issueLabelsSchema],
    floors: [{
      floorNumber: {type: Number},
      startRoom: {type: String},
      endRoom: {type: String}
    }],
    rooms: {type: Number},
    roomStyle: [roomStyleSchema],
    communityChat: [chatSchema],
    logs: [logsSchema]
  });

mongoose.model('Community', communitySchema);
