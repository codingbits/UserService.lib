'use strict';

var Service = require('./lib/user.service');

var UserService = function(){
  var self = this;
  var service = null;

  self.setup = function (config, InjectedService){
    service = new Service(config);
  };

  self.create = function(input, done) {
    service.create(input, function(err, result) {
      done(err, result);
    });
  };
  self.read = function(input, done) {
    service.read(input, function(err, result) {
      done(err, result);
    });
  };
  self.update = function(input, done) {
    service.update(input, function(err, result) {
      done(err, result);
    });
  };
  self.delete = function(input, done) {
    service.delete(input, function(err, result) {
      done(err, result);
    });
  };
  self.list = function(input, done) {
    service.list(input, function(err, result) {
      done(err, result);
    });
  };
  self.search = function(input, done) {
    service.search(input, function(err, result) {
      done(err, result);
    });
  }

  return self;
};

module.exports = new UserService();
