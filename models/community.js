var mongoose = require('mongoose');

var communitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    communityMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    pendingMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],

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
