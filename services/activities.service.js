const moment = require('moment');
const socketioJwt = require('socketio-jwt');
const activityCtrl = require('../controllers/activities/activities');

let io = null;

module.exports = function(socketConn) {
  io = socketConn;

  io.on('connection', socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    timeout: 15000
  }))
  .on('authenticated', (socket) => {

    socket.on('join-community', (community) => {

      if(community) {
        socket.join(community._id);

        socket.on('get-activities', (community) => {

          activityCtrl.recentActivities(community._id).then((activities) => {
            io.sockets.to(community._id).emit('recent-activities', activities);
          }, err => {
            console.log(err);
          });
        });
      }

    });

  });

};

module.exports.addActivity = function(text, userId, type, communityId) {

  let activity = {
    "type": type,
    "createdOn": moment().toDate(),
    "text": text,
    "userId": userId,
    "communityId": communityId
  };


  activityCtrl.addActivity(activity, (err, populatedActivity) => {
    if(populatedActivity) {
      console.log("Emitting to " + communityId);
      io.emit("add-activity", populatedActivity);
    } else {
      console.log(err);
    }
  });

};
