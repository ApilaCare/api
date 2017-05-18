const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const region = "s3-external-1";
const bucket = "apila";

// const region = "s3-us-west-2";
// const bucket = "apilatest2";

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

module.exports.deleteFile = async (key) => {

    if(!key) {
        return;
    }

    try {

        //remove the url part and just leave the path to bucket without a starting /
        const keyPath = (key.split(bucket)[1]).substring(1);

        const params = {
            Bucket: bucket,
            Key: keyPath,
        };

        const deleted = await s3bucket.deleteObject(params).promise();

        return deleted;

    } catch(err) {
        console.log(err);
        return err;
    }

};

module.exports.getRegion = () => {
  return region;
};

module.exports.getBucket = () => {
  return bucket;
};
