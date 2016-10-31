require('../../models/activities');
require('../../models/users');

const mongoose = require('mongoose');
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


module.exports.checkIfInCommunity = (userId, communityId) => {
  return User.find({"_id": userId, "community": communityId}).exec();
};
