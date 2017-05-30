const issueMember = require('./../emailTemplates/issueMember');

const transporter = require('./email').transporter;

module.exports.sendIssueMemberEmail = (from, to, issue, username, issuesOfMember) => {

  const mailOptions = {};

  mailOptions.from = from;
  mailOptions.to = to;

  mailOptions.subject = "You are assigned to the issue: " + issue.title;

  mailOptions.html = issueMember(username, issue.title, issuesOfMember, issue.description, issue.responsibleParty);

  return transporter.sendMail(mailOptions);
};