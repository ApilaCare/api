var mongoose = require('mongoose');

var roomStyleSchema = new mongoose.Schema({
    name: {type: String, required: true},
    area: {type: Number},
    areaUnit: {type: Boolean, default: true}, // if true: feet^2 | if false: meter^2
    rooms: [Number],

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
    logo: {type: String},
    fax: {type: String},
    floors: [Number],
    rooms: {type: Number},
    roomStyle: [roomStyleSchema]
});

mongoose.model('Community', communitySchema);
