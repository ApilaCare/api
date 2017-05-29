const issueRecover = require('./../emailTemplates/issueRecover');

const transporter = require('./email').transporter;

module.exports.sendConfidentialIssues = (from, to, recoveredUser, issues) => {
  mailOptions.from = from;
  mailOptions.to = to;
  mailOptions.attachments = [
    {
          path: "confidential.pdf"
    },
  ];
  mailOptions.subject = "Recovered confidetial issues for " + recoveredUser;

  mailOptions.html = issueRecover(recoveredUser);

  // mailOptions.text = 'You have recovered confidential issues for member' + recoveredUser + "\n" +
  //             "In the attachment confidential.pdf you can see all the confidential issues from the user";

  return transporter.sendMail(mailOptions);
};
