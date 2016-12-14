require('../../models/activities');
require('../../models/users');

const mongoose = require('mongoose');
const utils = require('../../services/utils');

let Activity = mongoose.model('Activity');
let User = mongoose.model('User');

module.exports.recentActivities = (communityId) => {

  return Activity.find({"communityId": communityId})
        .populate("userId", "name userImage community")
        .sort("-createdOn")
        .limit(10)
        .exec();
};

module.exports.addActivity = (data, callback) => {
  Activity.create(data, function(err, activity) {
    if(err) {
      console.log(err);
    } else {
      activity.populate({path: "userId", select: "name userImage community"}, callback);
    }
  });
};

module.exports.createToDoActivity = (req, res) => {

  Activity.create(req.body, function(err, activity) {
    if(err) {
      utils.sendJSONresponse(res, 500, err);
    } else {
      // activity.populate({path: "userId", select: "name userImage community"}, (act, err) => {
      //   if(err) {
      //     utils.sendJSONresponse(res, 500, err);
      //   } else {
          utils.sendJSONresponse(res, 200, activity);
      //  }
    //  });

    }
  });
};

module.exports.checkIfInCommunity = (userId, communityId) => {
  return User.find({"_id": userId, "community": communityId}).exec();
};
