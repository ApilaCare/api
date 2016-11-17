const carePointMap = require('./care_points_map.json');


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

   return carePointMap[field][value];
}
