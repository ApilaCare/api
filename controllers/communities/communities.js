var mongoose = require('mongoose');
var Community = mongoose.model('Community');
var User = mongoose.model('User');

var utils = require('../../services/utils');

var async = require('async');

const activitiesService = require('../../services/activities.service');
const GooglePlaces = require('node-googleplaces');

const places = new GooglePlaces(process.env.GOOGLE_PLACE_API);

function createCommunity(req, res) {
  Community.create(req.body, function(err, community) {
    if (err) {
      utils.sendJSONresponse(res, 400, err);
    } else {
      addUserToCommunity(req, res, community);
    }
  });
}

// POST /communities/new - Creates an empty community
module.exports.communitiesCreate = function(req, res) {

  searchPlace(req.body.name)
  .then(placeDetail)
  .then((details) => {

    if(details) {
      let deets = getDetails(details);

      req.body.phone = deets.phone;
      req.body.website = deets.website;
      req.body.fax = deets.fax;
      req.body.address = deets.address;
    }

    createCommunity(req, res);
  }) //if things go wrong you gonna catch dem hands
  .catch((demHands) => {
    console.log(demHands);

    createCommunity(req, res);
  });

};

// POST - /communites/:communityid/role/:userid - Switches or adds a user role
module.exports.addRole = function(req, res) {

  if (utils.checkParams(req, res, ['communityid', 'userid'])) {
    return;
  }

  Community.findOne({
    _id: req.params.communityid
  }, function(err, communites) {
    if (communites) {

      if (req.body.type === "boss") {
        communites.boss = req.params.userid;
        communites.minions.pull(req.params.userid);
        communites.directors.pull(req.params.userid);
      } else if (req.body.type === "directors") {
        communites.directors.push(req.params.userid);
        communites.minions.pull(req.params.userid);
      } else if (req.body.type === "minions") {
        communites.minions.push(req.params.userid);
        communites.directors.pull(req.params.userid);
      }

      communites.save(function(err) {
        if (err) {
          utils.sendJSONresponse(res, 404, {
            message: "Community not saved"
          });
        } else {
          utils.sendJSONresponse(res, 200, null);
        }
      });


    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Community not found"
      });
    }
  });
};

// GET /communities/ - List communities that aren't test communities
module.exports.communitiesList = function(req, res) {
  Community.find({
    "testCommunity": false
  }, function(err, communities) {
    utils.sendJSONresponse(res, 200, communities);
  });
};

// PUT /communities/pending/:communityid/ - add a new initation/pending member to a community
module.exports.addPendingMember = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  getAuthor(req, res, function(req, res, userId) {
    Community
      .findById(req.params.communityid)
      .exec(function(err, community) {

        if(err) {
          utils.sendJSONresponse(res, 404, err);
        } else {

          //The user is already pending for this community
          if(community.pendingMembers.indexOf(userId) !== -1) {
            utils.sendJSONresponse(res, 404, {"exists" : true});
            return;
          }

          community.pendingMembers.push(userId);

          community.save(function(err, community) {
            if (err) {
              utils.sendJSONresponse(res, 404, err);
            } else {

              let text = " wants to join " + community.name + " community";
              activitiesService.addActivity(text, userId, "community-join", community._id);

              utils.sendJSONresponse(res, 200, community);
            }
          });
        }

      });
  });

};

module.exports.declineMember = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Community
    .findById(req.params.communityid)
    .exec(function(err, community) {

      var index = community.pendingMembers.indexOf(req.body.member);

      if (index !== -1) {
        community.pendingMembers.splice(index, 1);
      }

      community.save(function(err, community) {
        if (err) {
          utils.sendJSONresponse(res, 404, err);
        } else {
          utils.sendJSONresponse(res, 200, community);
        }
      });

    });

};

//  PUT /communities/accept/:communityid/ - Accept a pending member to a community
module.exports.acceptMember = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Community
    .findById(req.params.communityid)
    .exec(function(err, community) {
      community.communityMembers.push(req.body.member);

      var index = community.pendingMembers.indexOf(req.body.member);

      if (index !== -1) {
        community.pendingMembers.splice(index, 1);
      }

      community.minions.push(req.body.member);

      //set the data in the user also
      User.findById(req.body.member, function(err, user) {

        // set the old community as a previous community before we change it
        user.prevCommunity = user.community;
        user.community = community._id;
        user.save();

        community.save(function(err, community) {
          if (err) {
            utils.sendJSONresponse(res, 404, err);
          } else {
            activitiesService.acceptedMember({id: req.body.member, communityName: community.name});

            utils.sendJSONresponse(res, 200, community);
          }
        });

      });

    });

};

module.exports.communitiesUpdateOne = function(req, res) {

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  Community
    .findById(req.params.communityid)
    .exec(
      function(err, community) {


        if (!community) {
          utils.sendJSONresponse(res, 404, {
            "message": "communityid not found"
          });
          return;
        } else if (err) {
          utils.sendJSONresponse(res, 400, err);
          return;
        }

        community.name = req.body.name;
        community.communityMembers = req.body.communityMembers;
        community.pendingMembers = req.body.pendingMembers;

        community.save(function(err, community) {
          if (err) {
            console.log(err);
            utils.sendJSONresponse(res, 404, err);
          } else {
            utils.sendJSONresponse(res, 200, community);
          }


        });
      }
    );
};

module.exports.communitiesReadOne = function(req, res) {

  if (req.params && req.params.communityid) {
    Community
      .findById(req.params.communityid)
      .exec(function(err, community) {
        if (!community) {
          utils.sendJSONresponse(res, 404, {
            "message": "communityid not found (from controller)"
          });
          return;
        } else if (err) {
          console.log(err);
          utils.sendJSONresponse(res, 404, err);
          return;
        }

        utils.sendJSONresponse(res, 200, community);
      });
  } else {
    console.log('No communityid specified');
    utils.sendJSONresponse(res, 404, {
      "message": "No communityid in request"
    });
  }
};


module.exports.removeMember = function(req, res) {

  if (utils.checkParams(req, res, ['userid', 'communityid'])) {
    return;
  }

  Community.findOne({
    "_id": req.params.communityid
  }, function(err, community) {
    if (community) {
      community.communityMembers.pull(req.params.userid);
      community.directors.pull(req.params.userid);
      community.minions.pull(req.params.userid);

      //community.creator = req.params.userid;

      removeCommunityFromUser(res, req.params.userid, function() {
        community.save(function(err) {
          if (err) {
            utils.sendJSONresponse(res, 404, {
              message: "Error updating community"
            });
          } else {
            utils.sendJSONresponse(res, 200, {
              message: "User removed"
            });
          }
        });
      });


    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Error finding community"
      });
    }
  });
};

// GET /communites/canceled/:userid
// we are counting that their will be only one community to restore
module.exports.hasCanceledCommunity = function(req, res) {

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  Community.findOne({
      "testCommunity": false,
      "creator": req.params.userid
    })
    .exec(function(err, community) {
      if (community) {
        utils.sendJSONresponse(res, 200, community);
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "Error while finding user"
        });
      }
    });
};


module.exports.updateRoomStyle = function(req, res) {
  Community.findOne({"_id": req.params.communityid})
   .exec((err, community) => {
     if(!err) {

       let roomStyleId = community.roomStyle.id(req.params.roomid);

       let index = community.roomStyle.indexOf(roomStyleId);
       let roomStyle = req.body;

       if(index !== -1) {
         community.roomStyle.set(index, roomStyle);
       } else {
         utils.sendJSONresponse(res, 500, {message: "Room not found"});
         return;
       }

       community.save((err, comm) => {
         if(!err) {
           utils.sendJSONresponse(res, 200, {});
         } else {
           utils.sendJSONresponse(res, 500, err);
         }
       });

     } else {
       utils.sendJSONresponse(res, 500, err);
     }
   });
};

//POST
module.exports.createRoomStyle = function(req, res) {
  Community.findOne({"_id": req.params.communityid})
   .exec((err, community) => {
     if(!err) {

       let newRoomStyle = req.body;

       community.roomStyle.push(newRoomStyle);

       community.save((err, comm) => {
         if(!err) {
           utils.sendJSONresponse(res, 200, comm.roomStyle[comm.roomStyle.length - 1]);
         } else {
           utils.sendJSONresponse(res, 500, err);
         }
       });

     } else {
       utils.sendJSONresponse(res, 500, err);
     }
   });
};

//PUT /communities/:communityid/contactinfo - Updates community Info of a community
module.exports.updateContactAndRoomInfo = function(req, res) {

  Community.findOne({"_id": req.params.communityid})
   .exec((err, community) => {

     if(err) {
       utils.sendJSONresponse(res, 500, err);
     } else {
       community.phone = req.body.phone;
       community.website = req.body.website;
       community.fax = req.body.fax;
       community.address = req.body.address;

       community.floors = req.body.floors || 0;
       community.rooms = req.body.rooms || 0;

       community.save((err, com) => {
         if(err) {
           utils.sendJSONresponse(res, 500, err);
         } else {
           utils.sendJSONresponse(res, 200, com);
         }
       });
     }

  });

};

module.exports.communitiesDeleteOne = function(req, res) {
  var communityid = req.params.communityid;
  if (communityid) {
    Community
      .findByIdAndRemove(communityid)
      .exec(
        function(err, community) {
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


module.exports.restoreCommunity = function(req, res) {

  var communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  User.find({
      "prevCommunity": communityid
    })
    .exec(function(err, users) {
      if (users) {


        async.each(users, function(user, cont) {
          user.community = user.prevCommunity;
          user.prevCommunity = communityid;

          user.save(function(err) {
            if (err) {
              cont(false);
            } else {
              cont();

            }
          });
        }, function(err) {
          utils.sendJSONresponse(res, 200, {
            "status": true
          });
        });
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "Error while finding users in community"
        });
      }
    });
};

module.exports.doCreateCommunity = function(communityInfo, callback) {

  var members = [];
  members.push(communityInfo.creator);

  Community.create({
    name: communityInfo.name,
    communityMembers: members,
    pendingMembers: [],
    creator: communityInfo.creator,
    boss: communityInfo.creator,
    testCommunity: true

  }, function(err, community) {

    if (err) {
      console.log(err);
      callback(false);
    } else {

      User.findById(communityInfo.creator)
        .exec(function(err, user) {
          if (user) {
            user.community = community._id;

            user.save(function(err) {
              if (err) {
                callback(false);
              } else {
                callback(true, community);
              }
            });
          } else {
            callback(false);
          }
        });

    }
  });
};

//PRIVATE FUNCTIONS

function addUserToCommunity(req, res, community) {
  var username = req.body.username;

  User
    .findOne({
      "name": username
    })
    .exec(function(err, u) {
      u.prevCommunity = u.community;
      u.community = community._id;

      community.communityMembers.push(u._id);
      community.creator = u;
      community.boss = u;

      community.save();

      u.save(function(err, user) {
        if (err) {
          utils.sendJSONresponse(res, 400, err);
        } else {
          utils.sendJSONresponse(res, 200, community);
        }
      });
    });
}


var getAuthor = function(req, res, callback) {

  if (req.body.pendingMember) {
    User
      .findOne({
        name: req.body.pendingMember
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

        callback(req, res, user._id);
      });

  } else {
    utils.sendJSONresponse(res, 404, {
      "message": "User not found"
    });
    return;
  }
};


function removeCommunityFromUser(res, userid, callback) {
  User.findById(userid)
    .exec(function(err, user) {
      if (user) {
        user.community = null;

        user.save(function(err) {
          if (err) {
            utils.sendJSONresponse(res, 500, {
              message: "Error while saving the user"
            });
          } else {
            callback();
          }
        });
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "User not found"
        });
      }
    });
}


//Given a name try to find it from google place api and return place id
function searchPlace(name) {
 return places.textSearch({query: name}).then((data) => {
     if(data.body.results[0]){
       return data.body.results[0].place_id;
     } else {
       return null;
     }
  });
}

// Get google place details from a provided api
function placeDetail(id) {
  if(!id) {
    return null;
  }

  return places.details({placeid: id}).then((details) => {
    return details.body;
  });
}

// Extracts the details from google place details object
function getDetails(data) {
  let details = data.result || {};

  return {
    phone: details.formatted_phone_number,
    website: details.website,
    fax: details.international_phone_number,
    address: details.formatted_address
  };
}
