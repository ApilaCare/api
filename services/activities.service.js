const moment = require('moment');
const socketioJwt = require('socketio-jwt');
const _ = require("lodash");

const activityCtrl = require('../controllers/activities/activities');
const chatCtrl = require('../controllers/chat/chat');

let io = null;

let connectedUsers = {};

module.exports = (socketConn) => {
  io = socketConn;

  io.on('connection', socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    timeout: 15000
  }))
  .on('authenticated', (socket) => {

    socket.on('join-community', (client) => {

      let community = client.community;
      let userid = client.userid;

      connectedUsers[userid] = socket.id;

      if(community) {
        socket.join(community._id);

        socket.on('get-activities', (community) => {

          activityCtrl.recentActivities(community._id).then((activities) => {

            let usersActivities = [];

            _.forEach(activities, function(activity) {
              activity.scope = activity.scope || 'community';

              if(activity.scope === 'community' || toString(activity.userId._id) === toString(userid)) {

                usersActivities.push(activity);
              }
            });

            io.sockets.to(community._id).emit('recent-activities', usersActivities);
          }, err => {
            console.log(err);
          });
        });
      }

    });

    socket.on('chat-msg', (msg) => {
      console.log(`${msg.message} has been received and send to ${msg.community}`);

      socket.broadcast.to(msg.community).emit("chat-newmsg", msg);

      chatCtrl.saveMsg(msg);
    });

    socket.on('get-community-msgs', async (community) => {

      let messages = await chatCtrl.listRecent(community);

      console.log(messages);

      console.log('community' + community);

      io.sockets.to(community).emit("community-msgs", messages);
    });

  });

};

//When a member is accepted in a community this gets called
module.exports.acceptedMember = (data) => {
  let userId = data.id;

  let socketId = connectedUsers[userId];

  if(socketId) {
    console.log("accepted member being send ");
    io.sockets.socket(socketId).emit('member-accepted', data);
  }

};

//dynamicly adds activity to the db ands sends the new activity to everybody in that community
module.exports.addActivity = (text, userId, type, communityId, scope, respUser) => {

  console.log(`CommunityId for activity: ${communityId}`);

  let responsibleUser = respUser || userId;

  let activity = {
    "type": type,
    "createdOn": moment().toDate(),
    "text": text,
    "userId": userId,
    "responsibleUser": responsibleUser,
    "communityId": communityId,
    "scope": scope
  };


  activityCtrl.addActivity(activity, (err, populatedActivity) => {
    if(populatedActivity) {
      io.sockets.to(communityId).emit("add-activity", populatedActivity);
    } else {
      console.log(err);
    }
  });

};
