var mongoose = require('mongoose');

var User = mongoose.model('User');

var stripeService = require('../../services/stripe');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};


module.exports.saveCreditCard = function(req, res) {
  var token = req.body.id;
  var user = req.params.userid;

  User.findById(user).exec(function(err, user) {
    if(user) {

      stripeService.saveCreditCard(token, user.email, function(status, id) {
        if(status) {
          user.stripeCustomer = id;

          stripeService.subscribeToPlan(id, function(subscription) {
            if(subscription) {

              user.stripeSubscription = subscription.id;

              user.save(function(err) {
                if(err) {
                  sendJSONresponse(res, 404, {message: "Error while saving user"});
                } else {
                  sendJSONresponse(res, 200, {status: true});
                }
              });

            } else {
              sendJSONresponse(res, 404, {message: "Error while creating user stripe subscription"});
            }
          });

        } else {
          sendJSONresponse(res, 404, {message: "Error while saving user card with stripe"});
        }
      });


    } else {
      sendJSONresponse(res, 404, {message: "Couldn't find the user"});
    }
  });
}

module.exports.getCustomer = function(req, res) {
  var user = req.params.userid;

  User.findById(user).exec(function(err, user) {
    if(user) {
      if(user.stripeCustomer) {
        stripeService.getCustomer(user.stripeCustomer, function(status, customer) {
          if(status) {
            sendJSONresponse(res, 200, {status: true, "customer" : customer});
          } else {
            sendJSONresponse(res, 404, {status: false});
          }
        });
      } else {

      }

    } else {
      sendJSONresponse(res, 404, {message: "Error while finding user"});
    }

  });
}

// get's full plans info for the default standard plan
module.exports.standardPlan = function(req, res) {
  stripeService.getStandardPlan(function(plan) {
    if(plan !== null) {
      console.log(plan);
      sendJSONresponse(res, 200, plan);
    } else {
      sendJSONresponse(res, 404, {message : "Standard plan not found"});
    }
  });
}
