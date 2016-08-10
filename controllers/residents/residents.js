var mongoose = require('mongoose');
var utils = require('../../services/utils');
var Resid = mongoose.model('Resident');
var User = mongoose.model('User');
var moment = require('moment');

// POST /residents/new - Creates a new resident
module.exports.residentsCreate = function(req, res) {

    // create resident from the inputed data
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

// GET list of residents
module.exports.residentsList = function(req, res) {
    Resid.find({"community" : req.params.communityid}, function(err, residents) {
        console.log(residents);
        utils.sendJSONresponse(res, 200, residents);
    });
};

module.exports.getAverageAge = function(req, res) {
  Resid.find({"buildingStatus" : "In Building",
              "community" : req.params.communityid},
  function(err, residents) {
    if(residents) {
      var averageAge = 0;

      for(var i = 0; i < residents.length; ++i) {
        var age = moment().diff(residents[i].birthDate, "years");
        averageAge += age;
      }

      averageAge = averageAge / residents.length;

      utils.sendJSONresponse(res, 200, averageAge);
    } else {
      utils.sendJSONresponse(res, 404, {message: "Residents not found"});
    }
  });
}

module.exports.averageStayTime = function(req, res) {
  Resid.find({"buildingStatus" : "In Building",
              "community" : req.params.communityid},
  function(err, residents) {
    if(residents) {
      var averageStay = 0;

      for(var i = 0; i < residents.length; ++i) {
        var stay = moment().diff(residents[i].admissionDate, "days");
        averageStay += stay;
      }

      averageStay = averageStay / residents.length;

      utils.sendJSONresponse(res, 200, averageStay);
    } else {
      utils.sendJSONresponse(res, 404, {message: "Residents not found"});
    }
  });
}


module.exports.residentsCount = function(req, res) {

  console.log("residentsCount: " + req.params.communityid);

    Resid.find({"community" : req.params.communityid, "buildingStatus": "In Building"},
    function(err, c) {
        console.log(c.length);
        utils.sendJSONresponse(res, 200, c.length);
    });
};

// GET /api/residents/:residentid
module.exports.residentsReadOne = function(req, res) {
    console.log('Finding resident details', req.params);
    if (req.params && req.params.residentid) {
        Resid
            .findById(req.params.residentid)
            .exec(function(err, resident) {
                if (!resident) {
                    utils.sendJSONresponse(res, 404, {
                        "message": "residentid not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    utils.sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(resident);
                utils.sendJSONresponse(res, 200, resident);
            });
    } else {
        console.log('No residentid specified');
        utils.sendJSONresponse(res, 404, {
            'message': 'No residentid in request'
        });
    }
};

// GET /residents/:communityid/locations - Get residents movedFrom (location) data
module.exports.getLocations = function(req, res) {

  var community = req.params.communityid;

  if(!community) {
    utils.sendJSONresponse(res, 404, {'message' : ''});
    return;
  }

  Resid.find({'community' : community})
  .select('movedFrom')
  .exec(function(err, communities) {
    if(communities) {
      console.log(communities);
      utils.sendJSONresponse(res, 200, communities);
    } else {
      utils.sendJSONresponse(res, 404, {'message' : 'residents not found'});
    }
  });
};


module.exports.residentById = function(req, res) {
    console.log('pozvao' + req.params.residentid);

    Resid
        .findById(req.params.residentid)
        .exec(
            function(err, resident) {

                console.log(resident);
                if (!resident) {
                    utils.sendJSONresponse(res, 404, {
                        "message": "resident not found"
                    });
                } else {

                    utils.sendJSONresponse(res, 200, resident);
                }
            });
};

module.exports.residentBirthday = function(req, res) {

    Resid.find({"community" : req.params.communityid})
    .exec(function(err, residents) {
      if(res) {
        utils.sendJSONresponse(res, 200, residents);
      } else {
        utils.sendJSONresponse(res, 404, null);
      }

    });
}

//small heplper functio to check if the fields is a number
function isNumber(obj) {
    return !isNaN(parseFloat(obj))
}

//when pushing to array make sure we aren't adding invalid data
function addToArray(arr, value, type) {

    if (value != undefined) {

      if(type === "Vitals") {
        value = value.data;
      }

        if(value != "") {
          if(type === "Vitals") {
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

// PUT /api/residents/update/:residentid
module.exports.residentsUpdateOne = function(req, res) {

    if (!req.params.residentid) {
        utils.sendJSONresponse(res, 404, {
            "message": "Not found, residentid is required"
        });
        return;
    }

    var updateInfo = {
        "updateBy": req.body.modifiedBy,
        "updateDate": req.body.modifiedDate,
        "updateField": req.body.updateField
    };

    req.body.updateInfo.push(updateInfo);

    var isValidData = true;


    if (isValidData === false) {
        console.log("invalid data");
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

    addToArray(req.body.foodAllergies, req.body.newfoodAllergies, "");
    addToArray(req.body.medicationAllergies, req.body.newmedicationAllergies, "");

    //addToArray(req.body.psychosocialStatus, req.body.newpsychosocialStatus, "");
    req.body.psychosocialStatus = req.body.newpsychosocialStatus;

    addToArray(req.body.foodLikes, req.body.newfoodLikes, "");
    addToArray(req.body.foodDislikes, req.body.newfoodDislikes, "");


    console.log(req.body);

    Resid.findOneAndUpdate({
            _id: req.params.residentid
        }, req.body,
        function(err, resident) {

            if (err) {
                console.log(err);
                utils.sendJSONresponse(res, 404, err);
            } else {
                utils.sendJSONresponse(res, 200, resident);
                //console.log(resident);
            }

        });

};

// DELETE /api/resident/:residentid
module.exports.residentsDeleteOne = function(req, res) {
    var residentid = req.params.residentid;
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
                    console.log("resident id " + residentid + " deleted");
                    utils.sendJSONresponse(res, 204, null);
                }
            );
    } else {
        utils.sendJSONresponse(res, 404, {
            "message": "No residentid"
        });
    }
};

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
                    utils.sendJSONresponse(res, 404, {
                        "message": "User not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    utils.sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(user);
                // run callback, passing user's name
                callback(req, res, user.name);
            });

    } else {
        utils.sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};


/* adding documents to mongodb
db.residents.save({

})
*/
