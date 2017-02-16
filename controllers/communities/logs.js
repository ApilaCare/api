const mongoose = require('mongoose');
const Community = mongoose.model('Community');

const utils = require('../../services/utils');

const _ = require('lodash');

//Add a new log entry on resident login
module.exports.addLogEntry = async (communityId, userId, ipAddress) => {

  try {

    const community = await Community.findById(communityId).exec();

    if(!community.logs) {
      community.logs = [];
    }

    community.logs.push({
      ipAddress: ipAddress,
      loggedOn: new Date(),
      user: userId
    });

    await community.save();

  } catch(err) {
    console.log(err);
  }

};

//GET /user_logs/:communityid/user/:userid
module.exports.listUserLogs = async (req, res) => {
  try {

    const userid = req.params.userid;
    const communityid = req.params.communityid;


    const community = await Community
                      .findById(communityid)
                      .populate("logs.user", "name email")
                      .exec();

    if(!community) {
      throw 'Community not found';
    }

    let userLogs = community.logs.filter(entry => entry.user._id.toString() === userid.toString());

    utils.sendJSONresponse(res, 200, userLogs);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 400, err);
  }
};

//GET /logs/:communityid - Gets logs for a particular community (last 100 entries)
module.exports.listLogs = async (req, res) => {
  try {

    const community = await Community
                      .findById(req.params.communityid)
                      .populate("logs.user", "name email")
                      .exec();

    if(!community) {
      throw 'Community not found';
    }

    if(community.logs.length > 100) {
      community.logs = community.logs.slice(1).slice(-100);
    }

    utils.sendJSONresponse(res, 200, community.logs);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 400, err);
  }
};
