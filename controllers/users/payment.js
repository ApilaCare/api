var utils = require('../../services/utils');
var mongoose = require('mongoose');

var User = mongoose.model('User');
var Community = mongoose.model('Community');
var async = require('async');

var stripeService = require('../../services/stripe');


module.exports.saveCreditCard = function(req, res) {
  var token = req.body.id;
  var user = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  //TODO: clean up call back hell
  User.findById(user).exec(function(err, user) {
    if (user) {

      stripeService.saveCreditCard(token, user.email, function(status, id) {
        if (status) {
          user.stripeCustomer = id;

          stripeService.subscribeToPlan(id, function(subscription) {
            if (subscription) {

              user.stripeSubscription = subscription.id;

              user.save(function(err) {
                if (err) {
                  utils.sendJSONresponse(res, 404, {
                    message: "Error while saving user"
                  });
                } else {
                  utils.sendJSONresponse(res, 200, {
                    status: true
                  });
                }
              });

            } else {
              utils.sendJSONresponse(res, 404, {
                message: "Error while creating user stripe subscription"
              });
            }
          });

        } else {
          utils.sendJSONresponse(res, 404, {
            message: "Error while saving user card with stripe"
          });
        }
      });


    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Couldn't find the user"
      });
    }
  });
};

module.exports.updateCustomer = function(req, res) {
  var userid = req.params.userid;
  var token = req.body.id;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  User.findById(userid).exec(function(err, user) {
    if (user) {
      stripeService.updateCustomer(user.stripeCustomer, token, function(customer) {
        if (customer) {
          utils.sendJSONresponse(res, 200, {
            "status": true,
            "customer": customer
          });
        } else {
          utils.sendJSONresponse(res, 404, {
            "status": false
          });
        }
      });
    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Couldn't find the user"
      });
    }
  });
};

module.exports.getCustomer = function(req, res) {
  var user = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }


  User.findById(user).exec(function(err, user) {
    if (user) {
      if (user.stripeCustomer) {
        stripeService.getCustomer(user.stripeCustomer, function(status, customer) {
            utils.sendJSONresponse(res, 200, {
              status: true,
              "customer": customer
            });
        });
      } else {
        utils.sendJSONresponse(res, 200, {
          status: false
        });
      }

    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Error while finding user"
      });
    }

  });
};

module.exports.cancelSubscription = function(req, res) {
  var userid = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  User.findById(userid).exec(function(err, user) {
    if (user) {
      stripeService.cancelSubscription(user.stripeSubscription, function(confirmation) {
        if (confirmation) {

          //revert all the members of the users community to their test community
          revertToTestCommunity(res, user.community, function(status) {
            if (status) {
              utils.sendJSONresponse(res, 200, status);
            } else {
              utils.sendJSONresponse(res, 404, {
                message: "Unable to revert users to test community"
              });
            }
          });

        } else {
          utils.sendJSONresponse(res, 404, {
            message: "Error while canceling stripe subscription"
          });
        }
      });
    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Error while finding user"
      });
    }
  });
};

// get's full plans info for the default standard plan
module.exports.standardPlan = function(req, res) {
  stripeService.getStandardPlan(function(plan) {
    if (plan !== null) {
      console.log(plan);
      utils.sendJSONresponse(res, 200, plan);
    } else {
      utils.sendJSONresponse(res, 404, {
        message: "Standard plan not found"
      });
    }
  });
};

// HELPER FUNCTIONS

function revertToTestCommunity(res, communityid, callback) {

  User.find({
      "community": communityid
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
          callback(true);
        });
      } else {
        utils.sendJSONresponse(res, 404, {
          message: "Error while finding users in community"
        });
      }
    });
}
