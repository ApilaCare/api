var mongoose = require('mongoose');
var utils = require('../../services/utils');
var Resid = mongoose.model('Resident');
var User = mongoose.model('User');
var moment = require('moment');

//TODO: birthday method needed?

// POST /residents/new - Creates a new resident
module.exports.residentsCreate = function(req, res) {

  Resid.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    birthDate: req.body.birthDate,
    maidenName: req.body.maidenName,
    admissionDate: req.body.admissionDate,
    buildingStatus: req.body.buildingStatus,
    sex: req.body.sex,
    submitBy: req.payload.name,
    community: req.body.community._id,
    administrativeNotes: req.body.administrativeNotes,
    movedFrom: req.body.movedFrom
  }, function(err, resident) {
    if (err) {
      utils.sendJSONresponse(res, 400, err);
    } else {
      utils.sendJSONresponse(res, 200, resident);
    }
  });
};

// GET /residents/list/:communityid - List all residents of a community
module.exports.residentsList = function(req, res) {

  var community = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Resid.find({
    'community': community
  }, function(err, residents) {
    if (err) {
      utils.sendJSONresponse(res, 404, {
        'message': 'Error listing residents'
      });
    } else {
      utils.sendJSONresponse(res, 200, residents);
    }

  });
};

// GET /residents/count/:communityid - Number of residents in building
module.exports.residentsCount = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Resid.find({
      'community': req.params.communityid,
      'buildingStatus': 'In Building'
    },
    function(err, c) {
      if (err) {
        utils.sendJSONresponse(res, 404, {
          'message': 'Error counting residents'
        });
      } else {
        utils.sendJSONresponse(res, 200, c.length);
      }
    });
};

// GET /residents/average_age/:communityid - Get's average agre of residents in the building
module.exports.getAverageAge = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Resid.find({
      'buildingStatus': 'In Building',
      'community': req.params.communityid
    },
    function(err, residents) {
      if (residents) {
        var averageAge = 0;

        for (var i = 0; i < residents.length; ++i) {
          var age = moment().diff(residents[i].birthDate, 'years');
          averageAge += age;
        }

        averageAge = averageAge / residents.length;

        utils.sendJSONresponse(res, 200, averageAge);
      } else {
        utils.sendJSONresponse(res, 404, {
          message: 'Residents not found'
        });
      }
    });
};

// GET /residents/average_stay/:communityid - Get's average stay of residents in the building
module.exports.averageStayTime = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Resid.find({
      "buildingStatus": "In Building",
      "community": req.params.communityid
    },
    function(err, residents) {
      if (residents) {
        var averageStay = 0;

        for (var i = 0; i < residents.length; ++i) {
          var stay = moment().diff(residents[i].admissionDate, "days");
          averageStay += stay;
        }

        averageStay = averageStay / residents.length;

        utils.sendJSONresponse(res, 200, averageStay);
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "Residents not found"
        });
      }
    });
};


// GET /residents/:communityid/locations - Get residents movedFrom (location) data
module.exports.getLocations = function(req, res) {

  var community = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Resid.find({
      'community': community
    })
    .select('movedFrom')
    .exec(function(err, communities) {
      if (communities) {
        utils.sendJSONresponse(res, 200, communities);
      } else {
        utils.sendJSONresponse(res, 404, {
          'message': 'residents not found'
        });
      }
    });
};

// GET /residents/:residentid - Get resident info by id
module.exports.residentById = function(req, res) {

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  Resid
    .findById(req.params.residentid)
    .exec(
      function(err, resident) {
        if (resident) {
          utils.sendJSONresponse(res, 200, resident);
        } else {
          utils.sendJSONresponse(res, 404, {
            'message': 'resident not found'
          });
        }
      });
};

// GET /residents/birthday/:communityid - Get residents of a communities (birthdays)
module.exports.residentBirthday = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Resid.find({
      "community": req.params.communityid
    })
    .exec(function(err, residents) {
      if (res) {
        utils.sendJSONresponse(res, 200, residents);
      } else {
        utils.sendJSONresponse(res, 404, null);
      }

    });
};

module.exports.addListItem = function(req, res) {
  Resid.findById(residentid)
    .exec(function(err, resident) {
      if (err) {
        utils.sendJSONresponse(res, 404, {'message' : err });
      } else {

        resident.save(function(err, r) {
          if(err) {
            utils.sendJSONresponse(res, 404, {'message' : err});
          } else {
            utils.sendJSONresponse(res, 200, r);
          }
        });

      }

    });
};

// DELETE /residents/:residentid/listitem - Removes a list item from resident info like foodLikes...
module.exports.removeListItem = function(req, res) {

  var residentid = req.params.residentid;

  Resid.findById(residentid)
    .exec(function(err, resident) {
      if (err) {
        utils.sendJSONresponse(res, 404, {'message' : err });
      } else {

        resident[req.body.type] = req.body.list;
        // resident.updateInfo({
        //   "updateField": {
        //     "field" : req.body.type,
        //     "new" : "",
        //     "old" : ""
        //   },
        //   "updateDate" : new Date(),
        //   "updateBy" : ""
        // });

        resident.save(function(err, r) {
          if(err) {
            utils.sendJSONresponse(res, 404, {'message' : err});
          } else {
            utils.sendJSONresponse(res, 200, r);
          }
        });

      }
    });
};

// PUT /api/residents/update/:residentid
module.exports.residentsUpdateOne = function(req, res) {

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  console.log(req.body.updateField);

  var updateInfo = {
    "updateBy": req.body.modifiedBy,
    "updateDate": req.body.modifiedDate,
    "updateField": req.body.updateField
  };

  if(req.body.updateField) {
    req.body.updateInfo.push(updateInfo);
  }

  var isValidData = true;


  if (isValidData === false) {
    utils.sendJSONresponse(res, 404, err);
  }

  addToArray(req.body.respiration, req.body.newrespiration, "Vitals");
  addToArray(req.body.vitalsPain, req.body.newvitalsPain, "Vitals");
  addToArray(req.body.pulse, req.body.newpulse, "Vitals");
  addToArray(req.body.oxygenSaturation, req.body.newoxygenSaturation, "Vitals");
  addToArray(req.body.bloodPressureDiastolic, req.body.newbloodPressureDiastolic, "Vitals");
  addToArray(req.body.bloodPressureSystolic, req.body.newbloodPressureSystolic, "Vitals");
  addToArray(req.body.temperature, req.body.newtemperature, "Vitals");
  addToArray(req.body.internationalNormalizedRatio, req.body.newinternationalNormalizedRatio, "Vitals");
  addToArray(req.body.weight, req.body.newweight, "Vitals");

  req.body.foodAllergies = req.body.newfoodAllergies;
  req.body.medicationAllergies = req.body.newmedicationAllergies;

  req.body.psychosocialStatus = req.body.newpsychosocialStatus;

  req.body.foodLikes = req.body.newfoodLikes;
  req.body.foodDislikes = req.body.newfoodDislikes;

  Resid.findOneAndUpdate({
      _id: req.params.residentid
    }, req.body,
    function(err, resident) {
      if (err) {
        utils.sendJSONresponse(res, 404, err);
      } else {
        utils.sendJSONresponse(res, 200, resident);
      }

    });

};

// DELETE /api/residents/:residentid - delete a resident by id
module.exports.residentsDeleteOne = function(req, res) {
  var residentid = req.params.residentid;

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  if (residentid) {
    Resid
      .findByIdAndRemove(residentid)
      .exec(
        function(err, resident) {
          if (err) {
            console.log(err);
            utils.sendJSONresponse(res, 404, err);
            return;
          }
          utils.sendJSONresponse(res, 204, null);
        }
      );
  } else {
    utils.sendJSONresponse(res, 404, {
      "message": "No residentid"
    });
  }
};


// HELPER FUNCTIONS

//To check if the fields is a number
function isNumber(obj) {
  return !isNaN(parseFloat(obj));
}

//when pushing to array make sure we aren't adding invalid data
function addToArray(arr, value, type) {

  if (value != undefined) {

    if (type === "Vitals") {
      value = value.data;
    }

    if (value != "") {
      if (type === "Vitals") {
        var info = {};
        info.data = value;
        info.date = new Date();
        arr.push(info);
      } else {
        arr.push(value);
      }

    }

  }

}
