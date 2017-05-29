const issueResParty = require('./../emailTemplates/issueResParty');

const transporter = require('./email').transporter;

module.exports.sendIssueMemberEmail = (from, to, issue, username) => {
  mailOptions.from = from;
  mailOptions.to = to;

  mailOptions.subject = "Issue responsible party";

  //mailOptions.html = issueResParty(link, username, issueTitle, issueSubmitBy, issueDesc);

  return transporter.sendMail(mailOptions);
};