const issueMember = require('./../emailTemplates/issueMember');

const transporter = require('./email').transporter;

module.exports.sendIssueMemberEmail = (from, to, issue, username) => {
  mailOptions.from = from;
  mailOptions.to = to;

  mailOptions.subject = "You are assigned to the issue";

  //mailOptions.html = issueMember(link, username, issueTitle, issueSubmitBy, issueDesc, issueResParty);

  return transporter.sendMail(mailOptions);
};