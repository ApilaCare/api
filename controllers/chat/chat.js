const mongoose = require('mongoose');
require('../../models/chat');
const Chat = mongoose.model('Chat');

const utils = require('../../services/utils');


module.exports.saveMsg = async (msg) => {
  try {

    let newMsg = new Chat(msg);

    let savedMsg = await newMsg.save();

    utils.sendJSONresponse(res, 200, savedMsg);

  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }
};


module.exports.listRecent = async (communityid, numMsgs) => {
  try {

    let msgs = await Chat.find({'community': communityid})
              .populate('userSend', '_id name userImage')
              //.sort("-timeSent")
              .limit(numMsgs)
              .exec();

    return msgs;

  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }
};
