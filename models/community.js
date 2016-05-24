var mongoose = require('mongoose');

var communitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    communityMembers: [String], // _id of members that are part of the community
    pendingMembers: [String], // _id of users that have asked to be part of the community

    /* not used yet fields

    phoneNumber: {type: Number},
    address: {type: String},
    logo: {type: buffer},
    faxNumber: {type: Number},
    floors: [Number],
    rooms: [Number],

    */
});

mongoose.model('Community', communitySchema);
