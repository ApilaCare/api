const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const region = "s3-external-1";
const bucket = "apila";

const s3bucket = new AWS.S3({
    params: {
        Bucket: bucket
    }
});


module.exports.uploadFile = async (params, file) => {

    try {

       const uploaded = await s3bucket.upload(params).promise();

       return uploaded;

    } catch(err) {
        console.log(err);
        throw err;
    }

};

module.exports.getRegion = () => {
  return region;
};

module.exports.getBucket = () => {
  return bucket;
};
