'use strict';

var Service = require('./lib/user.service');

var UserService = function(){
  var self = this;
  var service = null;


  self.setup = function (config, userModel){
    service = new Service(config, userModel);
  };

  self.create = function(input, done) {
    service.create(input, function(err, result) {
      if(err) {
        done(err, null);
      } else if(!result.success) {
        done(result.message, null);
      } else {
        done(null, result.data);
      }
    });
  };
  self.read = function(input, done) {
    service.read(input, function(err, result) {
      if(err) {
        done(err, null);
      } else if(!result.success) {
        done(result.message, null);
      } else {
        done(null, result.data);
      }
    });
  };
  self.update = function(input, done) {
    service.update(input, function(err, result) {
      if(err) {
        done(err, null);
      } else if(!result.success) {
        done(result.message, null);
      } else {
        done(null, result.data);
      }
    });
  };
  self.delete = function(input, done) {
    service.delete(input, function(err, result) {
      if(err) {
        done(err, null);
      } else if(!result.success) {
        done(result.message, null);
      } else {
        done(null, result.data);
      }
    });
  };
  self.list = function(input, done) {
    service.list(input, function(err, result) {
      if(err) {
        done(err, null);
      } else if(!result.success) {
        done(result.message, null);
      } else {
        done(null, result.data);
      }
    });
  };
  self.search = function(input, done) {
    service.search(input, function(err, result) {
      if(err) {
        done(err, null);
      } else if(!result.success) {
        done(result.message, null);
      } else {
        done(null, result.data);
      }
    });
  };

  return self;
};

module.exports = new UserService();
