var mongoose = require('mongoose');
var Appoint = mongoose.model('Appointment');
var User = mongoose.model('User');

var utils = require('../../services/utils');

const moment = require('moment');

const activitiesService = require('../../services/activities');

// POST /api/appointments/new - Creates a new appointment
module.exports.appointmentsCreate = function(req, res) {

  //create appointment from the inputed data
  Appoint.create({
    reason: req.body.reason,
    locationName: req.body.locationName,
    locationDoctor: req.body.locationDoctor,
    residentGoing: req.body.residentId,
    appointmentDate: req.body.appointmentDate,
    hours: req.body.hours,
    minutes: req.body.minutes,
    timezone: req.body.timezone,
    isAm: req.body.isAm,
    submitBy: req.payload._id,
    transportation: req.body.transportation,
    currMonth: moment(req.body.appointmentDate).format("YYYY M"),
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

//GET /appointments/locations/:communityid - Get's all appointments location for current week
module.exports.appointmentsLocations = async (req, res) => {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  const startWeek = moment().startOf('isoweek');
  const endWeek = moment().endOf('isoweek');

  try {

    const params = {
      "community": req.params.communityid,
      appointmentDate: { $gte: startWeek, $lt: endWeek }
    };

    const locations = await Appoint.find(params).select('locationName appointmentDate');

    utils.sendJSONresponse(res, 200, locations);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

// GET /appointments/today/:communityid - Number of appointments for today
module.exports.appointmentsToday = async (req, res) => {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  const startDay = moment().startOf('day');
  const endDay = moment().endOf('day');

  try {

    const params = {
      "community": req.params.communityid,
      appointmentDate: { $gte: startDay, $lt: endDay }
    };

    const appointCount = await Appoint.find(params).count();

    utils.sendJSONresponse(res, 200, appointCount);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }
};


/* PUT /api/appointments/:appointmentid - Updates the appointment */
module.exports.appointmentsUpdateOne = async (req, res) => {

  if (utils.checkParams(req, res, ['appointmentid'])) {
    return;
  }

  try {

    let appointment = await Appoint
      .findById(req.params.appointmentid)
      .populate("residentGoing", "_id firstName lastName middleName aliasName maidenName")
      .populate("appointmentComment.author", "name _id")
      .exec();

    let appointmentDate = new Date(req.body.date);
    let appointmentTime = new Date(req.body.time);

    appointmentDate.setHours(appointmentTime.getHours());
    appointmentDate.setMinutes(appointmentTime.getMinutes());
    appointmentDate.setSeconds(appointmentTime.getSeconds());

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

    let savedAppointment = await appointment.save();

    let popultedAppointment = await Appoint.populate(savedAppointment, "residentGoing");

    utils.sendJSONresponse(res, 200, popultedAppointment);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

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
