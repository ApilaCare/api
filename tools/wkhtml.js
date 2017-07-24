const wkhtmltopdf = require('wkhtmltopdf');

const fs = require('fs');

// URL
wkhtmltopdf("http://localhost:3000/exports/dnfdgd")
  .pipe(fs.createWriteStream('out2.pdf'));