var mongoose = require('mongoose');

var communitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    communityMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    pendingMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    boss: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    directors: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    minions: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    testCommunity: {type: Boolean, default: false},
    /*canceled: {type: Boolean, default: false}
     not used yet fields

    phoneNumber: {type: Number},
    address: {type: String},
    logo: {type: buffer},
    faxNumber: {type: Number},
    floors: [Number],
    rooms: [Number],

    */
});

mongoose.model('Community', communitySchema);
