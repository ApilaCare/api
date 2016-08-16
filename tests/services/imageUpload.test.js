var utils = require('../utils');
var assert = require('assert');

var imageUpload = require('../../services/imageUpload');

//TODO: figure out how to do an upload image test without over complication

describe('ImageUpload', function() {

  describe('#get region', function() {
    it('Gets the current aws region of our bucket', function() {
      assert.equal(imageUpload.getRegion(), 's3-us-west-2', 'Compare if we are on the west region');
    });
  });

  describe('#get bucket', function() {
    it('Gets the current aws bucket name', function() {
      assert.equal(imageUpload.getBucket(), 'apilatest2', 'Comapre if we are using the right bucket');
    });
  });

  // describe('#upload', function() {
  //   it('Uploads an image to aws', function() {
  //     imageUploadService.upload(params, file.path, function() {
  //
  //     });
  //   });
  // });

});
