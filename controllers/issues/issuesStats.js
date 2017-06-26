const mongoose = require('mongoose');
const utils = require('../../services/utils');

const Iss = mongoose.model('Issue');
const User = mongoose.model('User');

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