module.exports.PLAN_PER_USER = "plan_per_user";

module.exports.APILA_EMAIL = "Apila@apila.care";

const taskState = {
  "CURRENT" : "current",
  "COMPLETE" : "complete",
  "INACTIVE" : "inactive"
};

const day = {
  "MONDAY" : 1,
  "TUESDAY" : 2,
  "WEDNESDAY" : 3,
  "THURSDAY"  :4,
  "FRIDAY": 5,
  "SATURDAY" : 6,
  "SUNDAY" : 7

};

const occurrence = {
  "HOURLY": 0,
  "DAILY": 1,
  "WEEKLY": 2,
  "MONTHLY": 3
};

module.exports.day = day;
module.exports.occurrence = occurrence;
module.exports.taskState = taskState;
