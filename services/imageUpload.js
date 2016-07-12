(function() {

  var fs = require('fs');
  var AWS = require('aws-sdk');

  AWS.config.update({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
  });

  var region = "s3-us-west-2";
  var bucket = "apilatest2";

  var s3bucket = new AWS.S3({
      params: {
          Bucket: bucket
      }
  });

  module.exports.upload = function(params, file, callback) {
    s3bucket.upload(params, function(err, data) {

        if (err) {
            console.log("Error uploading data: ", err);
        } else {
            console.log("Successfully uploaded data aws");
            callback();
        }
      });
  }

  module.exports.getRegion = function() {
    return region;
  }

  module.exports.getBucket = function() {
    return bucket;
  }


})();
