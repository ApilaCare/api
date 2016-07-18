var mongoose = require('mongoose');
var Appoint = mongoose.model('Appointment');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* POST /api/appointments/new */
module.exports.appointmentsCreate = function(req, res) {

    //here we join the date & time
    var d = new Date(req.body.date);
    var t = new Date(req.body.time);

    d.setHours(t.getHours());
    d.setMinutes(t.getMinutes());

    console.log("DATE:    ");
    console.log(req.body.appointmentDate);

    //create appointment from the inputed data
    Appoint.create({
        reason: req.body.reason,
        locationName: req.body.locationName,
        locationDoctor: req.body.locationDoctor,
        residentGoing: req.body.residentId,
        time: d,
        appointmentDate: req.body.appointmentDate,
        hours: req.body.hours,
        minutes: req.body.minutes,
        timezone: req.body.timezone,
        isAm: req.body.isAm,
        submitBy: req.payload.name,
        transportation: req.body.transportation,
        community : req.body.community._id
    }, function(err, appointment) {
        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {
            getFullAppointment(req, res, appointment._id);
        }
    });
};

/* GET list of appointments */
module.exports.appointmentsList = function(req, res) {

    console.log(req);

    // change sensitivity to day rather than by minute
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    Appoint.find({
      "community" : req.params.communityid
    }).populate("residentGoing").exec(function(err, appointments) {
      //  console.log(appointments);
        console.log(appointments);
        sendJSONresponse(res, 200, appointments)
    });
};

/* GET list by month of appointments */
module.exports.appointmentsListByMonth = function(req, res) {


    console.log("appoint by month");

    // change sensitivity to day rather than by minute
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var months = {
      "January" : 0,
      "February": 1,
      "March" : 2,
      "April": 3,
      "May" : 4,
      "June": 5,
      "July" : 6,
      "August": 7,
      "September" : 8,
      "October": 9,
      "November" : 10,
      "December": 11
    };

    console.log(months[req.params.month]);

    var query = 'return this.time.getMonth() === ' + months[req.params.month];

    Appoint.find({
        $where : query
    }).populate("residentGoing").exec(function(err, appointments) {
      //  console.log(appointments);
        console.log("In appointment list")
        sendJSONresponse(res, 200, appointments)
    });
};

module.exports.appointmentsToday = function(req, res) {

   var today = new Date();

   console.log(req.params);

   var query = 'return this.appointmentDate.getDate() === ' + today.getDate();

    Appoint.find({
      "community" : req.params.communityid,
      $where : query
    }).exec(function(err, appointments) {

        var num = 0;

        if(appointments !== undefined) {
          num = appointments.length;
        }

        sendJSONresponse(res, 200, num)
    });
};

// get a single appointment details
module.exports.appointmentsReadOne = function(req, res) {
    console.log('Finding appointment details', req.params);
    if (req.params && req.params.appointmentid) {
        Appoint
            .findById(req.params.appointmentid)
            .populate("residentGoing")
            .exec(function(err, appointment) {
                if (!appointment) {
                    sendJSONresponse(res, 404, {
                        "message": "appointmentid not found (from controller)"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(appointment);
                sendJSONresponse(res, 200, appointment);
            });
    } else {
        console.log('No appointmentid specified');
        sendJSONresponse(res, 404, {
            "message": "No appointmentid in request"
        });
    }
};

/* PUT /api/appointments/:appointmentid */
module.exports.appointmentsUpdateOne = function(req, res) {

    console.log("In update appointment");

    if (!req.params.appointmentid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, appointmentid is required"
        });
        return;
    }

    Appoint
        .findById(req.params.appointmentid)
        .populate("residentGoing")
        .exec(
            function(err, appointment) {
                if (!appointment) {

                    sendJSONresponse(res, 404, {
                        "message": "appointmentid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }

                var d = new Date(req.body.date);
                var t = new Date(req.body.time);

                d.setHours(t.getHours());
                d.setMinutes(t.getMinutes());
                d.setSeconds(t.getSeconds());

                var updateInfo = {
                    "updateBy": req.body.modifiedBy,
                    "updateDate": req.body.modifiedDate,
                    "updateField": req.body.updateField
                };


                appointment.reason = req.body.reason;
                    appointment.locationName = req.body.locationName;
                    appointment.locationDoctor = req.body.locationDoctor;
                    appointment.time = d;
                    appointment.transportation = req.body.transportation;
                    appointment.cancel = req.body.cancel;
                    appointment.updateInfo.push(updateInfo);
                    appointment.hours = req.body.hours;
                    appointment.minutes = req.body.minutes;
                    appointment.isAm = req.body.isAm;
                    appointment.appointmentDate = req.body.appointmentDate;

                    appointment.residentGoing = req.body.residentId;

                appointment.save(function(err, appointment) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {

                        Appoint.
                        populate(appointment, "residentGoing",
                        function(err) {
                          //console.log(appointment);
                          sendJSONresponse(res, 200, appointment);
                        });


                    }
                });
            }
        );
};


/* DELETE /api/appointments/:appointmentid */
module.exports.appointmentsDeleteOne = function(req, res) {
    var appointmentid = req.params.appointmentid;
    if (appointmentid) {
        Appoint
            .findByIdAndRemove(appointmentid)
            .exec(
                function(err, appointment) {
                    if (err) {
                        console.log(err);
                        sendJSONresponse(res, 404, err);
                        return;
                    }
                    console.log("appointment id " + appointmentid + " deleted");
                    sendJSONresponse(res, 204, null);
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "No appointmentid"
        });
    }
};

var getFullAppointment = function(req, res, appointId) {
      Appoint
            .findById(appointId)
            .populate("residentGoing")
            .exec(function(err, appointment) {
                if (!appointment) {
                    sendJSONresponse(res, 404, {
                        "message": "appointmentid not found (from controller)"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
              //  console.log(appointment);
                sendJSONresponse(res, 200, appointment);
            });
}


var getAuthor = function(req, res, callback) {
    console.log("Finding author with email " + req.payload.email);
    // validate that JWT information is on request object
    if (req.payload.email) {
        User
        // user email address to find user
            .findOne({
                email: req.payload.email
            })
            .exec(function(err, user) {
                if (!user) {
                    sendJSONresponse(res, 404, {
                        "message": "User not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(user);
                // run callback, passing user's name
                callback(req, res, user.name);
            });

    } else {
        sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};
