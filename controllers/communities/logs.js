const mongoose = require('mongoose');
const Community = mongoose.model('Community');

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
