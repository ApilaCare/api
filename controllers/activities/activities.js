require('../../models/activities');
const mongoose = require('mongoose');
let Activity = mongoose.model('Activity');

module.exports.recentActivities = (res, req) => {



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
