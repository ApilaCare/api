// https://github.com/leemunroe/responsive-html-email-template

const style = require('./emailStyle').style;

module.exports = (username, issueTitle, issuesOfMembers, issueDesc, issueResParty) => {

  console.log(username, issueTitle, issuesOfMembers, issueDesc, issueResParty);

  return `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Verification Email</title>
      <style>
       ${style}
      </style>
    </head>
    <body class="">
      <table border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">

              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader">Verify your email with Apila</span>
              <table class="main">

                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p>Hi there ${username},</p>
                          <p>You have been added as a member to ${issueTitle} issue</p>
                          <p>Issue description: ${issueDesc}</p>
                          <p>Responsible party ${issueResParty.name}</p>
                          <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                            <tbody>
                              <tr>
                                <td align="left">
                                  <table border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                      <tr>
                                        <td> <a href="" target="_blank">Verify</a> </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- END MAIN CONTENT AREA -->
                </table>

              <!-- START FOOTER -->
              <div class="footer">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-block">
                      <span class="apple-link"><a href="https://apila.care">by Apila.care</a></span>
                    </td>
                  </tr>
                </table>
              </div>
              <!-- END FOOTER -->

            <!-- END CENTERED WHITE CONTAINER -->
            </div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>`

}
