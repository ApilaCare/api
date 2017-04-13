var mongoose = require('mongoose');
var Appoint = mongoose.model('Appointment');
var User = mongoose.model('User');

var utils = require('../../services/utils');

const moment = require('moment');

const activitiesService = require('../../services/activities');

// POST /api/appointments/new - Creates a new appointment
module.exports.appointmentsCreate = function(req, res) {

  let appointmentDate = moment(req.body.appointmentDate).startOf('day').toDate();

  //create appointment from the inputed data
  Appoint.create({
    reason: req.body.reason,
    locationName: req.body.locationName,
    locationDoctor: req.body.locationDoctor,
    residentGoing: req.body.residentId,
    appointmentDate: appointmentDate,
    hours: req.body.hours,
    minutes: req.body.minutes,
    timezone: req.body.timezone,
    isAm: req.body.isAm,
    submitBy: req.payload._id,
    transportation: req.body.transportation,
    currMonth: moment(appointmentDate).format("YYYY M"),
    community: req.body.community._id
  }, function(err, appointment) {
    if (err) {
      console.log(err);
      utils.sendJSONresponse(res, 400, err);
    } else {

      appointment.populate(
        {path: "residentGoing"},
        (err, appoint) => {
          if(err) {
            utils.sendJSONresponse(res, 500, err);
          } else {

            let location = appoint.locationName.name || appoint.locationName;

            let text = " created " + appoint.residentGoing.firstName + " " + appoint.residentGoing.lastName +
                                 " to " + location;

            activitiesService.addActivity(text, req.payload._id,
                                            "appointment-create", req.body.community._id);


            utils.sendJSONresponse(res, 200, appoint);
          }


        });

    }
  });
};

// GET /appointments/:communityid/month/:month - list all appointments populated with resident info
module.exports.appointmentsList = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  let month = req.params.month;

  Appoint.find({community: req.params.communityid, currMonth: month})
    .populate("residentGoing", "_id firstName aliasName middleName lastName")
    .populate("appointmentComment.author", "name _id")
    .exec(function(err, appointments) {
    if (err) {
      utils.sendJSONresponse(res, 404, {
        'message': 'Error while listing appointements'
      });
    } else {

      utils.sendJSONresponse(res, 200, appointments);
    }

  });
};


// GET /appointments/today/:communityid - Number of appointments for today
module.exports.appointmentsToday = function(req, res) {

  var today = new Date();

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  var query = 'return this.appointmentDate.getDate() === ' + today.getDate();

  Appoint.find({
    "community": req.params.communityid,
    $where: query
  }).exec(function(err, appointments) {
    if (err) {
      utils.sendJSONresponse(res, 404, {
        'message': 'Error while finding appointments'
      });
    } else {
      utils.sendJSONresponse(res, 200, appointments.length);
    }
  });
};


/* PUT /api/appointments/:appointmentid - Updates the appointment */
module.exports.appointmentsUpdateOne = function(req, res) {

  if (utils.checkParams(req, res, ['appointmentid'])) {
    return;
  }

  Appoint
    .findById(req.params.appointmentid)
    .populate("residentGoing")
    .exec(function(err, appointment) {
      if (!appointment) {

        utils.sendJSONresponse(res, 404, {
          "message": "appointmentid not found"
        });
        return;
      } else if (err) {
        utils.sendJSONresponse(res, 400, err);
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
          utils.sendJSONresponse(res, 404, err);
        } else {

          Appoint.
          populate(appointment, "residentGoing",
            function(err) {
              utils.sendJSONresponse(res, 200, appointment);
            });


        }
      });
    });
};


// DELETE /api/appointments/:appointmentid - deletes an appointment by its id
module.exports.appointmentsDeleteOne = function(req, res) {
  var appointmentid = req.params.appointmentid;
  if (appointmentid) {
    Appoint
      .findByIdAndRemove(appointmentid)
      .exec(
        function(err, appointment) {
          if (err) {
            console.log(err);
            utils.sendJSONresponse(res, 404, err);
            return;
          }
          console.log("appointment id " + appointmentid + " deleted");
          utils.sendJSONresponse(res, 204, null);
        }
      );
  } else {
    utils.sendJSONresponse(res, 404, {
      "message": "No appointmentid"
    });
  }
};
