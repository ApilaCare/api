const issueResParty = require('./../emailTemplates/issueResParty');

const transporter = require('./email').transporter;

module.exports.sendResponsibleMemberEmail = (from, to, issue, username, issuesOfMember) => {

  const mailOptions = {};

  mailOptions.from = from;
  mailOptions.to = to;

  mailOptions.subject = `You've been added as a responsible party to ${issue.title} issue`;

  mailOptions.html = issueResParty(username, issue.title, issue.description, issuesOfMember);

  return transporter.sendMail(mailOptions);
};