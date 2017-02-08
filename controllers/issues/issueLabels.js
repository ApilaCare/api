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

// PUT /issues/:issueid/labels/:labelname - Updates the label
module.exports.updateLabel = async (req, res) => {

    Iss.update({
      labels: labelname
    }, {
      $pullAll: {name: [labelname]}
    }, {multi: true}, function(err, kk) {
      if(err) {
        utils.sendJSONresponse(res, 400, err);
      }

      console.log(kk);

      utils.sendJSONresponse(res, 200, {});
    })




};

// DELETE /issues/:issueid/labels/:labelid - Removes a label by id
module.exports.issueLabelsDeleteOne = function(req, res) {

  if(utils.checkParams(req, res, ['issueid', 'labelid'])) {
    return;
  }

  Iss
    .findById(req.params.issueid)
    .select('labels updateInfo')
    .exec(
        function(err, issue) {
            if (!issue) {
                utils.sendJSONresponse(res, 404, {
                    "message": "issueid not found"
                });
                return;
            } else if (err) {
                utils.sendJSONresponse(res, 400, err);
                return;
            }
            if (issue.labels && issue.labels.length > 0) {
                if (!issue.labels.id(req.params.labelid)) {

                    utils.sendJSONresponse(res, 404, {
                        "message": "labelid not found"
                    });
                } else {
                    var label = issue.labels.id(req.params.labelid);

                    issue.labels.id(req.params.labelid).remove();

                    issue.save(function(err) {
                        if (err) {
                           console.log(err);
                            utils.sendJSONresponse(res, 404, err);
                        } else {
                            utils.sendJSONresponse(res, 204, {});
                        }
                    });
                }
            } else {
                utils.sendJSONresponse(res, 404, {
                    "message": "No label to delete"
                });
            }
        }
      );
};

var doAddLabel = function(req, res, issue) {

    if (!issue) {
        utils.sendJSONresponse(res, 404, "issueid not found");
    } else {
        issue.labels.push({
            name: req.body.name,
            color: req.body.color
        });

        issue.save(function(err, issue) {
            var thisLabel;
            if (err) {
                utils.sendJSONresponse(res, 400, err);
                console.log(err);
            } else {
                thisLabel = issue.labels[issue.labels.length - 1];
                utils.sendJSONresponse(res, 201, thisLabel);
            }
        });
    }
};
