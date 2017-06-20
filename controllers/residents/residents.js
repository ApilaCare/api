const mongoose = require('mongoose');
const utils = require('../../services/utils');
const Resid = mongoose.model('Resident');
const User = mongoose.model('User');
const moment = require('moment');

const _ = require('lodash');
const fs = require('fs');
const imageUploadService = require('../../services/imageUpload');
const activitiesService = require('../../services/activities');
const carePoints = require('./care_points');
const sanitize = require("sanitize-filename");

const cryptoHelper = require('../../services/crypto_helper');

// POST /residents/new - Creates a new resident
module.exports.residentsCreate = function(req, res) {

  let residentData = req.body;
  residentData.submitBy = req.payload._id;
  residentData.community = req.body.community._id;
  residentData.carePoints = 0; //set care point so the sort on the frontend works

  Resid.create(residentData, function(err, resident) {
    if (err) {
      utils.sendJSONresponse(res, 400, err);
    } else {

      let text = ` created resident ${req.body.firstName}  ${req.body.lastName}`;

      let community = req.body.community._id ? req.body.community._id : req.body.community;

      activitiesService.addActivity(text, req.payload._id, "resident-create", community, 'community');

      utils.sendJSONresponse(res, 200, resident);
    }
  });
};

// GET /residents/list/:communityid - List all residents of a community
module.exports.residentsList = async (req, res) => {

  var community = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  try {

    let fields = '_id firstName lastName aliasName carePoints birthDate';

    let residents = await Resid.find({'community': community})
                          .select(fields).sort({'carePoints': -1}).exec();

    utils.sendJSONresponse(res, 200, residents);
  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }

};

// GET /residents/full-list/:communityid - Full detailed List all residents of a community
module.exports.residentsFullList = async (req, res) => {

  var community = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  try {
    let residents = await Resid.find({'community': community})
                    .populate("submitBy", "_id name").sort({'carePoints': -1}).exec();

    utils.sendJSONresponse(res, 200, residents);
  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }

};


// GET /residents/count/:communityid - Number of residents in building
module.exports.residentsCount = async (req, res) => {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  try {

    let searchQuery = {community: req.params.communityid, buildingStatus: 'In Building'};

    let numResidents = await Resid.find(searchQuery).count().exec();

    utils.sendJSONresponse(res, 200, numResidents);

  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }

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
        let averageAge = 0;
        let residentCount = 0;

        for (let i = 0; i < residents.length; ++i) {
          if(residents[i].birthDate) {
            let age = moment().diff(residents[i].birthDate, 'years');
            if(age < 0) {age = 0;}
            averageAge += age;
            residentCount++;
          }

        }

        if(residentCount !== 0) {
          averageAge = averageAge / residentCount;
        }

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
        let averageStay = 0;
        let residentCount = 0;

        for (let i = 0; i < residents.length; ++i) {
          if(residents[i].admissionDate) {
            let stay = moment().diff(residents[i].admissionDate, "days");
            if(stay < 0) {stay = 0;}
            averageStay += stay;
            residentCount++;
          }
        }

        if(residentCount !== 0) {
          averageStay = averageStay / residentCount;
        }

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
module.exports.residentById = async (req, res) => {

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  try {
    let resident  = await Resid
                          .findById(req.params.residentid)
                          .populate('updateInfo.updateBy', 'email name userImage')
                          .populate('submitBy', 'name _id')
                          .populate('community')
                          .exec();

    if(resident.socialSecurityNumber) {
      if(resident.community) {
        getSSNByRole(req, resident);
      } else {
        resident.socialSecurityNumber = cryptoHelper.decrypt(resident.socialSecurityNumber);
      }
    }     

    utils.sendJSONresponse(res, 200, resident);
  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }
};

//POST /residents/:residentid/contact - Adds a new contact to the list
module.exports.addContact = function(req, res) {

  var residentid = req.params.residentid;

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  Resid.findById(residentid)
  .exec(function(err, resident) {
    if(err) {
      utils.sendJSONresponse(res, 404, {'message' : err});
    } else {
      resident.residentContacts.push(req.body);

      resident.updateInfo.push({
        "updateField": [{
          "field" : "create-contact",
          "new" : req.body.firstName + " " + req.body.lastName,
          "old" : "",
          "ipAddress" : req.headers['x-forwarded-for'] || req.connection.remoteAddress
        }],
        "updateDate" : new Date(),
        "updateBy" : req.body.submitBy
      });

      resident.save(function(err, resid) {
        if(err) {
          utils.sendJSONresponse(res, 404, {'message' : err});
        } else {
          utils.sendJSONresponse(res, 200, resid.residentContacts);
        }
      });
    }
  });

};

// PUT /residents/:residentid/listitem - Removes a list item from resident info like foodLikes...
module.exports.updateListItem = function(req, res) {

  var residentid = req.params.residentid;

  Resid.findById(residentid)
    .populate('updateInfo.updateBy', 'email name userImage')
    .exec(function(err, resident) {
      if (err) {
        utils.sendJSONresponse(res, 404, {'message' : err });
      } else {

        var oldValue = "";
        var newValue = "";

        if(req.body.operation === "remove") {
          resident[req.body.type].pull(req.body.selectedItem);
          oldValue = req.body.selectedItem;
        } else {
          resident[req.body.type].push(req.body.selectedItem);
          newValue = req.body.selectedItem;
        }

        resident.updateInfo.push({
          "updateField": [{
            "field" : req.body.type,
            "new" : newValue,
            "old" : oldValue,
            "ipAddress" : req.headers['x-forwarded-for'] || req.connection.remoteAddress
          }],
          "updateDate" : new Date(),
          "updateBy" : req.body.updateBy
        });


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

  var communicatedWith = setCommunicatedWithField(req);

  var updateInfo = {
    "updateBy": req.body.modifiedBy,
    "updateDate": req.body.modifiedDate,
    "updateField": req.body.updateField,
    "communicatedWith": communicatedWith,
    "ipAddress" : req.headers['x-forwarded-for'] || req.connection.remoteAddress
  };

  if(req.body.updateField) {
    req.body.updateInfo.push(updateInfo);
  }

  var isValidData = true;

  if (isValidData === false) {
    utils.sendJSONresponse(res, 404, err);
  }

  addToArray(req.body.respiration, req.body.newrespiration);
  addToArray(req.body.vitalsPain, req.body.newvitalsPain);
  addToArray(req.body.pulse, req.body.newpulse);
  addToArray(req.body.oxygenSaturation, req.body.newoxygenSaturation);
  addToArray(req.body.bloodPressureDiastolic, req.body.newbloodPressureDiastolic);
  addToArray(req.body.bloodPressureSystolic, req.body.newbloodPressureSystolic);
  addToArray(req.body.temperature, req.body.newtemperature);
  addToArray(req.body.internationalNormalizedRatio, req.body.newinternationalNormalizedRatio);
  addToArray(req.body.weight, req.body.newweight);

  req.body.foodAllergies = req.body.newfoodAllergies;
  req.body.medicationAllergies = req.body.newmedicationAllergies;

  req.body.psychosocialStatus = req.body.newpsychosocialStatus;
  req.body.shopping = req.body.newShoppingStatus;
  req.body.painManagedBy = req.body.newPainManagedBy;

  req.body.foodLikes = req.body.newfoodLikes;
  req.body.foodDislikes = req.body.newfoodDislikes;

  req.body.carePoints = carePoints.calculateCarePoints(req.body);

  if(req.body.socialSecurityNumber) {
    req.body.socialSecurityNumber = cryptoHelper.encrypt(req.body.socialSecurityNumber);
  }

  Resid.findOneAndUpdate({
    _id: req.params.residentid
  }, req.body)
  .populate('updateInfo.updateBy', 'email name userImage')
  .exec(function(err, resident) {
    if (err) {
      console.log(err);
      utils.sendJSONresponse(res, 404, err);
    } else {

      let community = req.body.community._id ? req.body.community._id : req.body.community;

      let text = ` updated resident  ${req.body.firstName} ${req.body.lastName}`;
      activitiesService.addActivity(text, req.payload._id, "resident-update", community, 'community');

      utils.sendJSONresponse(res, 200, resident);
    }

  });

};

//POST - /residents/:residentid/image - Upload the residents profile/image
module.exports.uploadResidentImage = async (req, res) => {

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }


  const file = req.files.file;

  const stream = fs.createReadStream(file.path);

  const community = req.body.community;
  const filePath = `${community}/Residents/${sanitize(file.originalFilename)}`;

  const params = {
    Key: filePath,
    Body: stream,
    ContentType: file.type
  };

  try {

    await imageUploadService.uploadFile(params, file.path);

    const fullUrl = `https://${imageUploadService.getRegion()}.amazonaws.com/${imageUploadService.getBucket()}/${filePath}`;

    fs.unlinkSync(file.path);

    const resident = await Resid.findById(req.params.residentid).exec();

    //delete old image 
    await imageUploadService.deleteFile(resident.residentImage);

    resident.residentImage = fullUrl;

    await resident.save();

    utils.sendJSONresponse(res, 200, fullUrl);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//POST /residents/:residentid/upload - uploads assessment files to aws
module.exports.uploadOutsideAgencyAssesment = function(req, res) {
  var residentid = req.params.residentid;

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  var file = req.files.file;

  var stream = fs.createReadStream(file.path);

  var params = {
    Key: sanitize(file.originalFilename),
    Body: stream
  };

  imageUploadService.upload(params, file.path, function() {
    let fullUrl = `https://${imageUploadService.getRegion()}.amazonaws.com/
      ${imageUploadService.getBucket()}/${escape(sanitize(file.originalFilename))}`;

    fs.unlinkSync(file.path);

    Resid.findById(residentid)
    .exec(function(err, resident) {
      if(err) {
        utils.sendJSONresponse(res, 404, {"message" : err});
      } else {
        resident.outsideAgencyFile.push(fullUrl);

        resident.save(function(err) {
          if(err) {
            utils.sendJSONresponse(res, 404, {"message" : err});
          } else {
            utils.sendJSONresponse(res, 200, fullUrl);
          }
        });
      }
    });

  });

};

// DELETE /api/residents/:residentid - delete a resident by id
module.exports.residentsDeleteOne = async (req, res) => {
  const residentid = req.params.residentid;

  if (utils.checkParams(req, res, ['residentid'])) {
    return;
  }

  try {
    const deletedResident = Resid.findByIdAndRemove(residentid).exec();

    utils.sendJSONresponse(res, 204, null);

  } catch(err) {
    utils.sendJSONresponse(res, 404, err);
  }

};

//POST /api/residents/resurrect - Bring back a resident which the user undo (the delete operation)
module.exports.resurrectResident = async (req, res) => {

  try {

    const resident = new Resid(req.body);

    await resident.save();

    utils.sendJSONresponse(res, 200, resident);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};


// HELPER FUNCTIONS

//when pushing to array make sure we aren't adding invalid data
function addToArray(arr, value) {

  if (value && value.data) {
    arr.push({
      data: value.data,
      date: new Date()
    });
  }

}

//get and decrypt the SSN number by the users current role (boss and director get full SSN)
function getSSNByRole(req, resident) {
    let ssn = cryptoHelper.decrypt(resident.socialSecurityNumber);

    //if we are boss or director show full ssn
    const userid = req.payload._id;

    const isDirector = resident.community.directors.indexOf(userid) !== -1;

    if(userid === resident.community.boss.toString() || isDirector) {
      resident.socialSecurityNumber = ssn;
    } else {
      resident.socialSecurityNumber = ssn.substr(ssn.length - 4);
    }

    return resident;
}


function setCommunicatedWithField(req) {
  let communicatedWith = [];

  if(req.body.communicatedWithResident === true) {
    communicatedWith.push("resident");
  }

  if(req.body.communicatedWithPrimaryContact === true) {
    communicatedWith.push("primary");
  }

  if(req.body.communicatedWithTrustedPerson === true) {
    communicatedWith.push("trusted");
  }

  return communicatedWith;
}
