
module.exports.calculateCarePoints = function(resident) {
  let sum = 0;

  for(let prop in resident) {
    if(resident.hasOwnProperty(prop)) {
      let points = getCarePoint(prop, resident[prop]);

      if(!isNaN(points)) {
        sum += points;
      }
    }
  }

  return sum;
};

function getCarePoint(field, value) {
   if(!carePointMap[field]) {
     return NaN;
   }

   console.log(`field: ${field}  value: ${value}`);

   return carePointMap[field][value];
}


// Care Point maping which field has what care point value
const carePointMap = {
  typeOfBathing: {
    "Shower": 0,
    "Bathtub": 1,
    "Spit Bath": 2
  },
  easilyUnderstood: {
    "false": 0,
    "true": 1
  },
  frequencyOfBathing: {
    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4
  },
  bathingAssist: {
    "Independent": 0,
    "Standby": 1,
    "Partial Assistance": 2,
    "Full Assistance": 3
  }
};
