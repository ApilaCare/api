const utils = require('../../services/utils');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Community = mongoose.model('Community');
const async = require('async');

const stripeService = require('../../services/stripe');

module.exports.updateStripeSubscription = async (userId, communityId) => {

  try {

    if(!communityId) {
      throw "No community id specified";
    }

    const numUsers = await User.find({community: communityId}).count();

    if(!numUsers) {
      throw "Number of users empty or zero";
    }

    const user = await User.findById(userId).exec();

    await stripeService.updateSubscription(user.stripeSubscription, numUsers)

    console.log(numUsers);

  } catch(err) {
    console.log(err);
  }

}


module.exports.saveCreditCard = async (req, res) => {
  const token = req.body.id;
  const userId = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  try {

    const user = await User.findById(userId).exec();

    if(!user) {
      throw "User not found";
    }

    const stripeUser = await stripeService.saveCreditCard(token, user.email);

    if(!stripeUser) {
      throw "Stripe user not saved";
    }

    const subscription = await stripeService.subscribeToPlan(stripeUser.id);

    if(!subscription) {
      throw "Stripe subscription not saved";
    }

    user.stripeSubscription = subscription.id;
    user.stripeCustomer = stripeUser.id;

    await user.save();

    utils.sendJSONresponse(res, 200, {status: true});

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

module.exports.updateCustomer = async (req, res) => {
  const userId = req.params.userid;
  const token = req.body.id;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  try {
    const user = await User.findById(userId).exec(); 
    
    const customer = await stripeService.updateCustomer(user.stripeCustomer, token);
    
    if(customer) {
      utils.sendJSONresponse(res, 200, {"status": true, "customer": customer});
    } else {
      utils.sendJSONresponse(res, 404, {"status": false});
    }

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 404, err);
  }

};

module.exports.getCustomer = async (req, res) => {

  const userId = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  try {
     
    const user = await User.findById(userId).exec();

    if (user.stripeCustomer) {
      const customer = await stripeService.getCustomer(user.stripeCustomer);

      utils.sendJSONresponse(res, 200, {status: true, customer: customer});
    } else {
      utils.sendJSONresponse(res, 200, {status: false});
    }

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 404, {});
  }

};

module.exports.cancelSubscription = async (req, res) => {
  const userId = req.params.userid;

  if (utils.checkParams(req, res, ['userid'])) {
    return;
  }

  try {

    const user = await User.findById(userId).exec();
  
    const canceled = await stripeService.cancelSubscription(user.stripeSubscription);

    if(canceled) {
        //revert all the members of the users community to their test community
        revertToTestCommunity(res, user.community, status => {
          if (status) {
            utils.sendJSONresponse(res, 200, status);
          } else {
            utils.sendJSONresponse(res, 404, {
              message: "Unable to revert users to test community"
            });
          }
        });

    } else {
      throw "Error while canceling stripe subscription";
    }

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }
 
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
