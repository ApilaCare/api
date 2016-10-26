require('../../models/activities');
const mongoose = require('mongoose');
let Activity = mongoose.model('Activity');

module.exports.recentActivities = () => {
  return Activity.find().sort("-createdOn").limit(10).exec();
};

module.exports.addActivity = (data) => {
  Activity.create(data, function(err, activity) {
    if(err) {
      console.log(err);
    } else {
      console.log("Activity saved");
    }
  });
};
