require('../../models/activities');
const mongoose = require('mongoose');
let Activity = mongoose.model('Activity');

module.exports.recentActivities = () => {
  return Activity.find().populate("userId", "name userImage").sort("-createdOn").limit(10).exec();
};

module.exports.addActivity = (data, callback) => {
  Activity.create(data, function(err, activity) {
    if(err) {
      console.log(err);
    } else {
      activity.populate({path: "userId", select: "name userImage"}, callback);
    }
  });
};
