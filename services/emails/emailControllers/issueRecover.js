const issueRecover = require('./emailTemplates/issueRecover');

module.exports.sendConfidentialIssues = function(from, to, recoveredUser, issues, callback) {
  mailOptions.from = from;
  mailOptions.to = to;
  mailOptions.attachments = [
    {
          path: "confidential.pdf"
    },
  ];
  mailOptions.subject = "Recovered confidetial issues for " + recoveredUser;
  mailOptions.text = 'You have recovered confidential issues for member' + recoveredUser + "\n" +
              "In the attachment confidential.pdf you can see all the confidential issues from the user";

  transporter.sendMail(mailOptions, callback);
};
