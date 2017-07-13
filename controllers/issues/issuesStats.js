const mongoose = require('mongoose');
const utils = require('../../services/utils');

const Iss = mongoose.model('Issue');
const User = mongoose.model('User');
const Community = mongoose.model('Community');

const _ = require('lodash');

//GET /issues/count/:userid/id/:communityid - Number of open issues asigned to an user
module.exports.issuesOpenCount = async (req, res) => {

  const userid = req.params.userid;
  const community = req.params.communityid;

  if (utils.checkParams(req, res, ['userid', 'communityid'])) {
    return;
  }

  const conditions = {
      status: "Open",
      responsibleParty: userid,
      community: community
  };

  try {

    const issuesCount = await Iss.find(conditions).count().exec();

    utils.sendJSONresponse(res, 200, issuesCount);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 404, 0);
  }

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

    const sortedActivities = _.sortBy(community.activityRates, "issueActivityRate");

    const groupedActivities = _.groupBy(sortedActivities, "name");

    utils.sendJSONresponse(res, 200, groupedActivities);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//POST /issues/:communityid/labelstats - Adds a new label stats info
module.exports.addLabelStats = async (req, res) => {

  try {

    const communityid = req.params.communityid;

    const community = await Community.findById(communityid).exec();

    if(!community) {
      throw "Community not found";
    }

    if(!community.labelStats) {
      community.labelStats = [];
    }

    const newStats = [];

    Object.keys(req.body).forEach((elem, key) => {

      newStats.push({
        name: elem,
        date: new Date(),
        score: req.body[elem]
      });
    });

    community.labelStats.push(...newStats);

    await community.save();

    utils.sendJSONresponse(res, 200, community.labelStats[community.labelStats.length - 1]);


  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//GET /issues/:communityid/labelstats - Returns a list of label stats for a community
module.exports.getLabelStats = async (req, res) => {
    try {

    const communityid = req.params.communityid;

    const community = await Community.findById(communityid).exec();

    if(!community) {
      throw "Community not found";
    }

    utils.sendJSONresponse(res, 200, community.labelStats);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }
};