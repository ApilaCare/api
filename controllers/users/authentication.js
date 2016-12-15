var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var communityCtrl = require('../communities/communities');
var todoCtrl = require('../todos/todos');
var utils = require('../../services/utils');
var emailService = require('../../services/email');

const crypto = require('crypto');

const cons = require('../../services/constants');

// POST /register - User registration
module.exports.register = function(req, res) {

  // respond with an error status if not al required fields are found
  if (!req.body.name || !req.body.email || !req.body.password) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  //create a new user instance and set name and email
  var user = new User();

  user.name = req.body.name;
  user.email = req.body.email.toLowerCase();

  // use setPassword method to set salt and hash
  user.setPassword(req.body.password);

  // create a new empty to do on register
  todoCtrl.createEmptyToDo(function(todoid) {
    if(todoid) {
      //Save User
      user.todoid = todoid;
      saveUser(user, todoid, res);
    } else {
      utils.sendJSONresponse(res, 500, {"message" : "Error while saving todo"});
    }
  });

};

// POST /login - User login
module.exports.login = function(req, res) {
  // validate that required fields have been supplied
  if (!req.body.email || !req.body.password) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  req.body.email = req.body.email.toLowerCase();

  // pass name of strategy and a callback to authenticate method
  passport.authenticate('local', function(err, user, info) {
    var token;
    // return an error if Passport returns an error
    if (err) {
      utils.sendJSONresponse(res, 404, err);
      return;
    }
    // if Passport returned a user instance, generate and send a JWT (json web token)
    if (user) {
      token = user.generateJwt();

      utils.sendJSONresponse(res, 200, {
        "token": token
      });
      // otherwise return infor message (why authentication failed)
    } else {
      utils.sendJSONresponse(res, 401, info);
    }
    // make sure that req and res are available to Passport
  })(req, res);
};

function saveUser(user, todoid, res) {

  var tokenVerify = generateToken(user.email);

  emailService.sendVerificationEmail(cons.APILA_EMAIL, user.email, tokenVerify)
  .then(() => {
    user.verifyToken = tokenVerify;
  })
  .then(() => {

    user.save(function(err, u) {
      var token;
      if (err) {
        utils.sendJSONresponse(res, 404, err);
        return;
      } else {
        // generate a JWT using schema method and send it to browser
        token = user.generateJwt();

        var data = {
          "creator": u._id,
          "name": "Test"
        };


          // create the user a new test community
          communityCtrl.doCreateCommunity(data, function(status, community) {
            if (status) {
              utils.sendJSONresponse(res, 200, {
                'token': token,
                'community': community,
                'id': user._id,
                'todoid' : todoid
              });
              return;
            } else {
              utils.sendJSONresponse(res, 404, {
                message: "Error while creating test community"
              });
              return;
            }
          });

      }
    });
  })
  .catch((err) => {
    console.log(err);
    utils.sendJSONresponse(res, 500, {'err': "failed_send"});
  });
}

function generateToken(email) {
  return crypto.createHash('md5').update(email + process.env.JWT_SECRET).digest('hex');
}
