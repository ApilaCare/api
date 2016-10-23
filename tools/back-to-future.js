var fs = require('fs');
var moment = require('moment');

(function main() {

  var currDate = moment();

  fs.writeFileSync("date.txt", currDate.valueOf());

  console.log("Current date: " + currDate.format('MMMM Do YYYY, h:mm:ss a'));

  parseArguments(currDate);
})();

function parseArguments(currDate) {

  if(process.argv.length === 4) {

    switch (process.argv[2]) {
      case "hour":
          updateDate("hour", currDate);
        break;

      case "day":
          updateDate("day", currDate);
        break;

      case "week":
          updateDate("week", currDate);
        break;

      case "month":
          updateDate("month", currDate);
        break;
      default:

    }
  }
}

function updateDate(key, currDate) {
  var incrementBy = process.argv[3];

  var changedDay = currDate.add(incrementBy, key);
  fs.writeFileSync("date.txt", changedDay.valueOf());
  console.log("New date: " + changedDay.format('MMMM Do YYYY, h:mm:ss a'));
}
