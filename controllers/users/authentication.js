const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const communityCtrl = require('../communities/communities');
const todoCtrl = require('../todos/todos');
const utils = require('../../services/utils');
const emailService = require('../../services/email');
const logs = require('../communities/logs');

const crypto = require('crypto');

const cons = require('../../services/constants');

// POST /register - User registration
module.exports.register = async (req, res) => {

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
  let todoid = await todoCtrl.createEmptyToDo();

  if(todoid) {
    user.todoid = todoid;
    saveUser(user, todoid, res);
  } else {
    utils.sendJSONresponse(res, 404, {message: "Error while creating todo"});
  }


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

      const usersIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      logs.addLogEntry(user.community, user._id, usersIpAddress);

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

async function saveUser(user, todoid, res) {

  console.log(utils.generateToken(user.email));

  let tokenVerify = utils.generateToken(user.email);



  try {

    user.verifyToken = tokenVerify;

    let savedUser = await user.save();

    await emailService.sendVerificationEmail(cons.APILA_EMAIL, user.email, tokenVerify);

    let data = {
      "creator": savedUser._id,
      "name": "Test"
    };

    // create the user a new test community
    let community = await communityCtrl.doCreateCommunity(data, user);

    let token = user.generateJwt(community._id);

    if(community) {
      utils.sendJSONresponse(res, 200, {
            'token': token,
            'community': community,
            'id': user._id,
            'todoid' : todoid
          });
    } else {
      utils.sendJSONresponse(res, 404, {message: "Error while creating test community"});
    }


  } catch(err) {
    utils.sendJSONresponse(res, 404, err);
    console.log(err);
  }

}

function generateToken(email) {
  return crypto.createHash('md5').update(email + process.env.JWT_SECRET).digest('hex');
}
