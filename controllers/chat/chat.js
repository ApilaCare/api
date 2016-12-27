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


module.exports.listRecent = async (communityid) => {
  try {

    let msgs = await Chat.find({'community': communityid}).exec();

    return msgs;

  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }
};
