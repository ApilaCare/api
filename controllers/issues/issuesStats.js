const mongoose = require('mongoose');
const utils = require('../../services/utils');

const Iss = mongoose.model('Issue');
const User = mongoose.model('User');
const Community = mongoose.model('Community');

//GET /issues/count/:userid/id/:communityid - Number of open issues asigned to an user
module.exports.issuesOpenCount = function(req, res) {

  var userid = req.params.userid;
  var community = req.params.communityid;

  if (utils.checkParams(req, res, ['userid', 'communityid'])) {
    return;
  }

  Iss.find({
    status: "Open",
    responsibleParty: userid,
    community: community
  }, function(err, issues) {
    if (issues) {
      utils.sendJSONresponse(res, 200, issues.length);
    } else {
      utils.sendJSONresponse(res, 404, 0);
    }

  });
};

// GET /issues/issuescount/:communityid - Number of open isues for a community
module.exports.issuesCount = async (req, res) => {

  var communityid = req.params.communityid;

  if (utils.checkParams(req, res, ['communityid'])) {
    return;
  }

  try {

    let searchQuery = { status: "Open", community: communityid };

    let issueCount = await Iss.find(searchQuery).count().exec();

    utils.sendJSONresponse(res, 200, issueCount);
  } catch(err) {
    utils.sendJSONresponse(res, 500, err);
  }

};

//POST /issues/:communityid/activityrate - Adds a new activity score for the user
module.exports.addActivityRate = async (req, res) => {

  try {

    const communityid = req.params.communityid;

    const community = await Community.findById(communityid).exec();

    if(!community) {
      throw "Community not found";
    }

    if(!community.activityRates) {
      community.activityRates = [];
    }

    community.activityRates.push(req.body);

    await community.save();

    utils.sendJSONresponse(res, 200, community.activityRates[community.activityRates.length - 1]);


  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//GET /issues/:communityid/activityrate/:userid - Gets all the activity rates for the user
module.exports.getActivityRates = async (req, res) => {

  try {

    const communityid = req.params.communityid;
    const userid = req.params.userid;

    const community = await Community.findById(communityid).exec();

    if(!community) {
      throw "Community not found";
    }

    utils.sendJSONresponse(res, 200, community.activityRates.filter(rate => rate.user == userid));

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//GET /issues/:communityid/rankings - Get a list of user rankings for a community
module.exports.userActivityRankings = async (req, res) => {

  try {

    const communityid = req.params.communityid;

    const community = await Community.findById(communityid).exec();

    if(!community) {
      throw "Community not found";
    }

    utils.sendJSONresponse(res, 200, community.activityRates);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};