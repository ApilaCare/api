const carePointMap = require('./care_points_map.json');

// Goes throgh each propery of resident and if defined in carePointMap sum the values
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

//get's the field and extracts the care point value for that field
function getCarePoint(field, value) {
   if(!carePointMap[field]) {
     return NaN;
   }

   if(!carePointMap[field][value]) {
     return NaN;
   }

   return carePointMap[field][value];
}
