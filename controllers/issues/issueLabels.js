const mongoose = require('mongoose');
const utils = require('../../services/utils');

const Iss = mongoose.model('Issue');
const User = mongoose.model('User');
const Community = mongoose.model('Community');

const _ = require('lodash');

// POST /issues/label/:communityid - Creates a new label for that community
module.exports.createLabel = async (req, res) => {
  try {

    if(utils.checkParams(req, res, ['communityid'])) {
      return;
    }

    let community = await Community.findById(req.params.communityid).exec();

    if(!community.labels) {
      community.labels = [];
    }

    community.labels.push({
        name: req.body.name,
        color: req.body.color
    });

    let savedCommunity = await community.save();

    utils.sendJSONresponse(res, 200, savedCommunity.labels[savedCommunity.labels.length - 1]);

  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }
};


// POST /issues/:issueid/labels/:labelid - Adds a label to card
module.exports.addLabelToCard = async (req, res) => {

  try {

    const labelid = req.params.labelid;

    let issue = await Iss.findById(req.params.issueid).exec();

    issue.labels.push({
      name: req.body.name,
      color: req.body.color
    });

    await issue.save();

    utils.sendJSONresponse(res, 200, {});

  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }

};

// DELETE /issues/:issueid/labels/:labelname - Removes a label from card
module.exports.removeLabelFromCard = async (req, res) => {

  try {

    const labelname = req.params.labelname;

    let issue = await Iss.findById(req.params.issueid).exec();


    const index = _.findIndex(issue.labels, {name: labelname});

    if(index === -1) {
      throw 'Label not found';
    }

    issue.labels.splice(index, 1);

    await issue.save();

    utils.sendJSONresponse(res, 200, {});

  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }

};

// PUT /issues/:communityid/labels/:labelname - Updates the label
module.exports.updateLabel = async (req, res) => {

  try {

    //update in community
    let community = await Community.findById(req.params.communityid).exec();
    community.labels = updateLabel(community.labels, req.body, req.params.labelname);
    await community.save();

    let issues = await Iss.find({'labels.name' : req.params.labelname}).exec();

    let cnt = 0;

    // update in all the issues
    issues.forEach((issue) => {

      issue.labels = updateLabel(issue.labels, req.body, req.params.labelname);

      issue.save((err) => {
        cnt++;
        if(cnt === issues.length) {
          utils.sendJSONresponse(res, 200, {});
        }
      });


    });


  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }

};

// DELETE /issues/:communityid/labels/:labelname - Removes a label by id
module.exports.deleteLabel = async (req, res) => {

  try {

    //update in community
    let community = await Community.findById(req.params.communityid).exec();

    const index = _.findIndex(community.labels, {name: req.params.labelname});
    community.labels.splice(index, 1);

    await community.save();

    let issues = await Iss.find({'labels.name' : req.params.labelname}).exec();

    let cnt = 0;


    issues.forEach((issue) => {

      const index = _.findIndex(issue.labels, {name: req.params.labelname});

      issue.labels.splice(index, 1);

      issue.save((err) => {
        cnt++;
        if(cnt === issues.length) {
          utils.sendJSONresponse(res, 200, {});
        }
      });


    });


  } catch(err) {
    utils.sendJSONresponse(res, 400, err);
  }
};

function updateLabel(labels, data, labelname) {
  const index = _.findIndex(labels, {name: labelname});

  labels[index].name = data.newName;
  labels[index].color = data.color;

  return labels;
}
