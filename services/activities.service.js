const moment = require('moment');
const activityCtrl = require('../controllers/activities/activities');

let io = null;

module.exports = function(socketConn) {
  io = socketConn;

  io.on('connection', function(socket) {
    socket.on('get-activities', (data) => {
      
      activityCtrl.recentActivities().then((activities) => {
        socket.emit('recent-activities', activities);
      }, err => {
        console.log(err);
      });
    });
  });

};

module.exports.addActivity = function(text, author, type) {

  let activity = {
    "type": type,
    "createdOn": moment().toDate(),
    "text": text,
    "author": author
  };

  activityCtrl.addActivity(activity);

  io.emit("add-activity", activity);
};
