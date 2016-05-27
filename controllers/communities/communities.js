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

      //console.log(community);

        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {

          User
          .findOne({"name":username})
          .exec(function(err, u) {
            u.community = community;

            console.log(u);

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

  Community
      .findById(req.params.communityid)
      .exec(function(err, community) {
          community.pendingMembers.push(req.body.pendingMember);

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


function addUserToCommunity(req, res, community) {
  var username = req.body.username;

  User
  .findById(username)
  .exec(function(err, user) {
    user.community = community;

    user.save(function(err, user) {
      if(err) {
        sendJSONresponse(res, 400, err);
      } else {
        console.log("User added to community");
      }
    });

  });
}
