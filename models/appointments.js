var mongoose = require('mongoose');

var appointmentCommentSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    commentText: {type: String, required: true},
    createdOn: {type: Date, "default": Date.now}
});

var appointmentSchema = new mongoose.Schema({
    reason: {type: String},
    locationName: {type: mongoose.Schema.Types.Mixed, required: true},
    locationDoctor: {type: String, default: ''},
    residentGoing: {type: mongoose.Schema.Types.ObjectId, ref: 'Resident'},
    appointmentDate : {type: Date},
    hours: {type: Number},
    minutes: {type: Number},
    timezone: {type: Number},
    isAm: {type: Boolean},
    transportation: {type: String, default: 'We are Transporting'},
    cancel: {type: Boolean, default: false},
    currMonth: {type: String},
    appointmentComment: [appointmentCommentSchema],
    submitDate: {type: Date, default: Date.now, required: true},
    submitBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    community: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
    updateInfo: [mongoose.Schema.Types.Mixed],
});

mongoose.model('Appointment', appointmentSchema);

/* adding documents to mongodb
db.appointments.save({

})
*/
