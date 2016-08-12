var mongoose = require('mongoose');
var Community = mongoose.model('Community');
var User = mongoose.model('User');

var utils = require('../../services/utils');

var async = require('async');

// POST /communities/new - Creates an empty community
module.exports.communitiesCreate = function(req, res) {

    Community.create({
        name : req.body.name,
        communityMembers : req.body.communityMembers,
        pendingMembers : req.body.pendingMembers

    }, function(err, community) {
        if (err) {
          utils.sendJSONresponse(res, 400, err);
        } else {
          addUserToCommunity(req, res, community);
        }
    });
};

// POST - /communites/:communityid/role/:userid - Switches or adds a user role
module.exports.addRole = function(req, res) {

  Community.findOne({_id: req.params.communityid}, function(err, communites) {
    if(communites) {

      if(req.body.type === "boss") {
        communites.boss = req.params.userid;
        communites.minions.pull(req.params.userid);
        communites.directors.pull(req.params.userid);
      } else if(req.body.type === "directors") {
        communites.directors.push(req.params.userid);
        communites.minions.pull(req.params.userid);
      } else if(req.body.type === "minions") {
        communites.minions.push(req.params.userid);
        communites.directors.pull(req.params.userid);
      }

      communites.save(function(err) {
        if(err) {
          utils.sendJSONresponse(res, 404, {message: "Community not saved"});
        } else {
          utils.sendJSONresponse(res, 200, null);
        }
      });


    } else {
      utils.sendJSONresponse(res, 404, {message: "Community not found"});
    }
  });
};

// GET /communities/ - List communities that aren't test communities
module.exports.communitiesList = function(req, res) {
    Community.find({"testCommunity" : false}, function(err, communities) {
        console.log(communities);
        utils.sendJSONresponse(res, 200, communities);
    });
};

// PUT /communities/pending/:communityid/ - add a new initation/pending member to a community
module.exports.addPendingMember = function(req, res) {
  if (!req.params.communityid) {
      utils.sendJSONresponse(res, 404, {
          "message": "Not found,  communityid"
      });
      return;
  }

  getAuthor(req, res, function(req, res, userId) {
    Community
        .findById(req.params.communityid)
        .exec(function(err, community) {
            community.pendingMembers.push(userId);

            community.save(function(err, community) {
              if(err) {
                utils.sendJSONresponse(res, 404, err);
              } else {
                utils.sendJSONresponse(res, 200, community);
              }
            });
          });
        });

};

module.exports.declineMember = function(req, res) {
  if (!req.params.communityid) {
      utils.sendJSONresponse(res, 404, {
          "message": "Not found,  communityid"
      });
      return;
  }

  Community
      .findById(req.params.communityid)
      .exec(function(err, community) {

          var index = community.pendingMembers.indexOf(req.body.member);

          if(index !== -1) {
            community.pendingMembers.splice(index, 1);
          }

          community.save(function(err, community) {
            if(err) {
              utils.sendJSONresponse(res, 404, err);
            } else {
              utils.sendJSONresponse(res, 200, community);
            }
          });

          });

};

//  PUT /communities/accept/:communityid/ - Accept a pending member to a community
module.exports.acceptMember = function(req, res) {
  if (!req.params.communityid) {
      utils.sendJSONresponse(res, 404, {
          "message": "Not found,  communityid"
      });
      return;
  }

  Community
      .findById(req.params.communityid)
      .exec(function(err, community) {
          community.communityMembers.push(req.body.member);

          var index = community.pendingMembers.indexOf(req.body.member);

          if(index !== -1) {
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
                if(err) {
                  utils.sendJSONresponse(res, 404, err);
                } else {
                  utils.sendJSONresponse(res, 200, community);
                }
              });

        });

        });

};

module.exports.communitiesUpdateOne = function(req, res) {
    if (!req.params.communityid) {
        utils.sendJSONresponse(res, 404, {
            "message": "Not found,  communityid"
        });
        return;
    }
    Community
        .findById(req.params.communityid)
        .exec(
            function(err, community) {

                console.log(community);

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
                community.communityMembers =  req.body.communityMembers;
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
                console.log(community);
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

  console.log(req.params.communityid);

  Community.findOne({"_id" : req.params.communityid}, function(err, community) {
    if(community) {
      community.communityMembers.pull(req.params.userid);
      community.directors.pull(req.params.userid);
      community.minions.pull(req.params.userid);

      console.log(req.params.username);

      //if the user we are removing is the creator, set the one who removed him the creator
      if(req.params.userid === community.creator) {
        User.findOne({name: req.params.username}, function(err, user) {
          if(user) {
            community.creator = user._id;
          } else {
            utils.sendJSONresponse(res, 404, {message: "Error finding user"});
          }
        });
      }

      removeCommunityFromUser(res, req.params.userid, function() {
        community.save(function(err) {
          if(err) {
            utils.sendJSONresponse(res, 404, {message: "Error updating community"});
          } else {
            utils.sendJSONresponse(res, 200, {message: "User removed"});
          }
        });
      });


    } else {
      utils.sendJSONresponse(res, 404, {message: "Error finding community"});
    }
  });
};

// GET /communites/canceled/:userid
// we are counting that their will be only one community to restore
module.exports.hasCanceledCommunity = function(req, res) {
  Community.findOne({"testCommunity" : false, "creator" : req.params.userid})
  .exec(function(err, community) {
    if(community) {
      utils.sendJSONresponse(res, 200, community);
    } else {
      utils.sendJSONresponse(res, 404, {message: "Error while finding user"});
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

  User.find({"prevCommunity" : communityid})
  .exec(function(err, users) {
    if(users) {

      console.log(users);
      async.each(users, function(user, cont) {
        user.community = user.prevCommunity;
        user.prevCommunity = communityid;

        user.save(function(err) {
          if(err) {
            cont(false);
          } else {
            cont();

          }
        });
      }, function(err) {
        utils.sendJSONresponse(res, 200, {"status" : true});
      });
    } else {
      utils.sendJSONresponse(res, 404, {message: "Error while finding users in community"});
    }
  });
};

module.exports.doCreateCommunity = function(communityInfo, callback) {

  var members = [];
  members.push(communityInfo.creator);

  Community.create({
      name : communityInfo.name,
      communityMembers : members,
      pendingMembers : [],
      creator : communityInfo.creator,
      boss : communityInfo.creator,
      testCommunity : true

  }, function(err, community) {

      if (err) {
          console.log(err);
          callback(false);
      } else {

        User.findById(communityInfo.creator)
        .exec(function(err, user) {
          if(user) {
            user.community = community._id;

            user.save(function(err) {
              if(err) {
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
    .findOne({"name":username})
    .exec(function(err, u) {
        u.prevCommunity = u.community;
        u.community = community._id;

        community.communityMembers.push(u._id);
        community.creator = u;
        community.boss = u;

        community.save();

        u.save(function(err, user) {
          if(err) {
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
                console.log(user);
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
    if(user) {
      user.community = null;

      user.save(function(err) {
        if(err) {
          utils.sendJSONresponse(res, 500, {message: "Error while saving the user"});
        } else {
          callback();
        }
      });
    } else {
      utils.sendJSONresponse(res, 404, {message: "User not found"});
    }
  });
}
