var mongoose = require('mongoose');
var Community = mongoose.model('Community');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.communitiesCreate = function(req, res) {

    var username = req.body.username;

    console.log(username);

    Community.create({
        name : req.body.name,
        communityMembers : req.body.communityMembers,
        pendingMembers : req.body.pendingMembers

    }, function(err, community) {

        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {

          addUserToCommunity(req, res, community);

        }
    });
};

module.exports.communitiesList = function(req, res) {
    Community.find({}, function(err, communities) {
        console.log(communities);
        sendJSONresponse(res, 200, communities);
    });
};

//add a new initation/pending member to a community
module.exports.addPendingMember = function(req, res) {
  if (!req.params.communityid) {
      sendJSONresponse(res, 404, {
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
                sendJSONresponse(res, 404, err);
              } else {
                sendJSONresponse(res, 200, community);
              }
            });
          });
        });

}

module.exports.declineMember = function(req, res) {
  if (!req.params.communityid) {
      sendJSONresponse(res, 404, {
          "message": "Not found,  communityid"
      });
      return;
  }

  Community
      .findById(req.params.communityid)
      .exec(function(err, community) {

          var index = community.pendingMembers.indexOf(req.body.member);

          if(index != -1) {
            community.pendingMembers.splice(index, 1);
          }

          community.save(function(err, community) {
            if(err) {
              sendJSONresponse(res, 404, err);
            } else {
              sendJSONresponse(res, 200, community);
            }
          });

          });

}

//accept member to a community
module.exports.acceptMember = function(req, res) {
  if (!req.params.communityid) {
      sendJSONresponse(res, 404, {
          "message": "Not found,  communityid"
      });
      return;
  }

  Community
      .findById(req.params.communityid)
      .exec(function(err, community) {
          community.communityMembers.push(req.body.member);

          var index = community.pendingMembers.indexOf(req.body.member);

          if(index != -1) {
            community.pendingMembers.splice(index, 1);
          }

          //set the data in the user also
          User.findById(req.body.member, function(err, user) {
            user.community = community._id;

            user.save();
          });

          community.save(function(err, community) {
            if(err) {
              sendJSONresponse(res, 404, err);
            } else {
              sendJSONresponse(res, 200, community);
            }
          });

          });

}

module.exports.communitiesUpdateOne = function(req, res) {
    if (!req.params.communityid) {
        sendJSONresponse(res, 404, {
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
                    sendJSONresponse(res, 404, {
                        "message": "communityid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }

                community.name = req.body.name;
                community.communityMembers =  req.body.communityMembers;
                community.pendingMembers = req.body.pendingMembers;

                community.save(function(err, community) {
                            if (err) {
                                console.log(err);
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, community);
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
                    sendJSONresponse(res, 404, {
                        "message": "communityid not found (from controller)"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(community);
                sendJSONresponse(res, 200, community);
            });
    } else {
        console.log('No communityid specified');
        sendJSONresponse(res, 404, {
            "message": "No communityid in request"
        });
    }
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
                        sendJSONresponse(res, 404, err);
                        return;
                    }

                    sendJSONresponse(res, 204, null);
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "No residentid"
        });
    }
};


var getAuthor = function(req, res, callback) {
    console.log("Finding author with name " + req.body.pendingMember);
    if (req.body.pendingMember) {
        User
            .findOne({
                name: req.body.pendingMember
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
                callback(req, res, user._id);
            });

    } else {
        sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};

function addUserToCommunity(req, res, community) {
  var username = req.body.username;


  User
  .findOne({"name":username})
  .exec(function(err, u) {
    u.community = community._id;

    community.communityMembers.push(u._id);

    console.log(u);

    community.save();

    u.save(function(err, user) {
      if(err) {
        sendJSONresponse(res, 400, err);
      } else {
        console.log("User added to community");
        sendJSONresponse(res, 200, community);
      }
    });

  });
}
