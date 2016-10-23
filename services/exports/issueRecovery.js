var pdf = require('pdfkit');
var fs = require('fs');

module.exports.exportPdf = function(issues, name) {
  var doc = new pdf;

  doc.pipe(fs.createWriteStream(name));

  doc.text("Confidential issues", 50, 50);

  // write out titles of issues in pdf
  for (var i = 0; i < issues.length; ++i) {
    doc.text(issues[i].title, 50, 80 + (i * 15));
  }

  doc.end();

  return doc;
};
