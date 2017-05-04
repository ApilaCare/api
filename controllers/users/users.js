const mongoose = require('mongoose');
const utils = require('../../services/utils');

const User = mongoose.model('User');
const Community = mongoose.model('Community');

const emailService = require('../../services/email');
const async = require('async');
const crypto = require('crypto');

const fs = require('fs');
const imageUploadService = require('../../services/imageUpload');
const sanitize = require("sanitize-filename");
const APILA_EMAIL = require('../../services/constants').APILA_EMAIL;


// GET /users/getuser/:userid - Get user info by userid
module.exports.getUser = function(req, res) {

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  if(req.payload._id !== req.params.userid) {
    utils.sendJSONresponse(res, 404, {err: "Requesting other peoples info"});
  }

  User.findById(req.params.userid)
    .populate("", "-salt -hash")
    .exec(function(err, user) {
      if (user) {
        utils.sendJSONresponse(res, 200, user);
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "User not found!"
        });
      }
    });
};

// GET /users/list/:community - List all users from a community
module.exports.usersInCommunity = function(req, res) {

  if (utils.checkParams(req, res, ['community'])) {
    return;
  }

  User.find({
      community: req.params.community
    })
    .populate("recovery", "-salt -hash")
    .select("name _id email")
    .exec(function(err, users) {
      if (err) {
        utils.sendJSONresponse(res, 404, {
          "message": err
        });
      } else {
        utils.sendJSONresponse(res, 200, users);
      }
    });

};

// GET /users/community/:userid - Gets community info for a userid
module.exports.userCommunity = function(req, res) {

  var userid = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  User.findById(userid)
    .exec(function(err, user) {
      if (err) {
        sendJSONresponse(res, 404, {
          "message": "Error while finding user"
        });
      } else {
        if (user) {
          Community.findById(user.community)
            .populate("communityMembers pendingMembers directors minions creator boss communityMembers.recovery", "-salt -hash")
            .exec(function(err, community) {
              if (err) {
                utils.sendJSONresponse(res, 400, {
                  "message": "Error while finding community"
                });
              } else {
                utils.sendJSONresponse(res, 200, community);
              }
            });
        }
      }
    });
};

// GET /users/:userid/image - Gets users image url
module.exports.userImage = function(req, res) {

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  User.findById(req.params.userid)
    .exec(function(err, user) {
      if (user) {
        utils.sendJSONresponse(res, 200, user.userImage);
      } else {
        utils.sendJSONresponse(res, 404, null);
      }
    });
};

// POST /users/forgotpassowrd/:email - Send reset email for password
module.exports.forgotPassword = function(req, res) {

  if (utils.checkParams(req, res, ['email'])) {
    return;
  }

  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');

    User.findOne({
      "email": req.params.email
    }, function(err, user) {

      if (user) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          doSendPasswordForget(req, res, token);
        });
      } else {
        utils.sendJSONresponse(res, 404, null);
      }


    });

  });

};

//POST /users/:userid/verify_email - Sends an verify email for the specified user
module.exports.sendVerifyEmail = async (req, res) => {

  try {

    const user = await User.findById(req.params.userid).exec();

    const token = utils.generateToken(user.email);

    await emailService.sendVerificationEmail(APILA_EMAIL, user.email, token);

    utils.sendJSONresponse(res, 200, {msg: 'Verify email sent'});

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

module.exports.resetPassword = function(req, res) {

  if (utils.checkParams(req, res, ['token'])) {
    return;
  }

  User.findOne({
      "resetPasswordToken": req.params.token,
      "resetPasswordExpires": {
        $gt: Date.now()
      }
    },
    function(err, user) {

      if (user) {
        user.setPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          utils.sendJSONresponse(res, 200, null);
        });
      } else {
        utils.sendJSONresponse(res, 403, null);
      }

    });
};

module.exports.uploadImage = function(req, res) {

  var file = req.files.file;

  var stream = fs.createReadStream(file.path);

  var params = {
    Key: sanitize(file.originalFilename),
    Body: stream
  };

  imageUploadService.upload(params, file.path, function() {

    var fullUrl = "https://" + imageUploadService.getRegion() + ".amazonaws.com/" +
      imageUploadService.getBucket() + "/" + escape(sanitize(file.originalFilename));

    fs.unlinkSync(file.path);

    User.findById(req.params.userid)
      .exec(function(err, user) {
        if (user) {
          user.userImage = fullUrl;
          user.save(function(err) {
            if (err) {
              utils.sendJSONresponse(res, 404, {
                message: "Unable to save user"
              });
            } else {
              utils.sendJSONresponse(res, 200, fullUrl);
            }
          });
        } else {
          utils.sendJSONresponse(res, 404, {
            message: "Unable to find user"
          });
        }
      });


  });
};

module.exports.updateUsername = function(req, res) {

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  User.findById(req.params.userid)
    .exec(function(err, user) {
      if (user) {
        user.name = req.body.username;

        user.save(function(err, u) {
          if (err) {
            console.log(err);
            if (err.err.indexOf('dup key') !== -1) {
              utils.sendJSONresponse(res, 404, {
                'message': 'This username is already taken'
              });
            } else {
              utils.sendJSONresponse(res, 404, {
                'message': 'Error while saving user'
              });
            }
          } else {
            utils.sendJSONresponse(res, 200, u);
          }
        });
      } else {
        utils.sendJSONresponse(res, 404, {
          'message': 'User not found'
        });
      }
    });
};

//POST
module.exports.verifyEmail = function(req, res) {
  let token = req.params.token;

  User.findOne({verifyToken: token}).exec((err, user) => {

    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {
      if(!user) {
        utils.sendJSONresponse(res, 200, {status: false});
      } else {
        user.active = true;

        user.save((err) => {
          if(err) {
            utils.sendJSONresponse(res, 500, err);
          } else {
            utils.sendJSONresponse(res, 200, {status: true});
          }
        });
      }

    }

  });

};

// HELPER FUNCTIONS

function doSendPasswordForget(req, res, token) {
  emailService.sendForgotPassword("noreply@apila.care", req.params.email, token, req.headers.host,
    function(error, info) {
      if (error) {
        utils.sendJSONresponse(res, 404, null);
      } else {
        utils.sendJSONresponse(res, 200, null);
      }
    });
}
