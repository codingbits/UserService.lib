'use strict';

var Emitter = require("events").EventEmitter;
var util = require("util");
var _ = require('lodash');
var uuid = require('node-uuid');
var db = require("mongoDAL");
var Verror = require('verror');
var User = require('./user.model.js');

var ServiceResult = function(){

    var result = {
        success: false,
        message: null,
        data: null
    };

    return result;
};

var UserService = function(config) {
  Emitter.call(this);
  var self = this;
  var continueWith = null;


  // Make sure there is an email
  var validateUser = function(user){
    if(!user.email) {
      user.setInvalid('Email is required');
      self.emit('invalid', user);
    } else {
      user.setValid();
      self.emit('valid', user);
    }
  };

  // Check against the DB to make sure the email doesn't already exist.
  var checkIfUserExists = function(user) {
    db.users.exists({ email: user.email }, function(err, exists) {
      if(err) {
        var error = new Verror(err, 'User Service Exists Failed');
        //TODO: Log Error
        user.setInvalid('This email already exists');
        self.emit('invalid', user);
      }
        if(exists) {
          user.setInvalid("This email already exists");
          self.emit("invalid", user);
        } else{
          self.emit("create-user", user);
        }
    });
  };

  // Save the User to the Database.
  var createUser = function(user) {
    user.status = "approved";
    user.signInCount = 1;
    user.password = "";

    db.users.saveData(user, function(err, newUser){
      if(err) {
        var error = new Verror(err, 'User Service Save Failed');
        //TODO: Log Error
        user.setInvalid('User Failed to Save');
        self.emit('invalid');
      }
      self.emit("send-user", newUser);
    });
  };

  // Retrieve the First user from the Database.
  var readUser = function(user) {
    db.users.first(user, function(err, result) {
      if(err) {
        var error = new Verror(err, 'User Service Read Failed');
        //TODO:  Log Error
        user.setInvalid('User not found');
        self.emit('invalid');
      }
      self.emit('send-user', result);
    });
  }

  // Update the user from the Database
  var updateUser = function(user) {
    db.users.updateOnly(user, user.id, function(err, result){
      if(err) {
        var error = new Verror(err, 'User Service Update Failed');
        //TODO: Log Error
        user.setInvalid('User Update Failed');
        self.emit('invalid');
      }
      if(!result) {
        user.setInvalid('User Update Failed');
        self.emit('invalid');
      }
      self.emit('send-user', user);
    });
  }

  // Delete the user from the Database
  var deleteUser = function(user) {
    db.users.destroy(user.id, function(err, result) {
      if(err) {
        var error = new Verror(err, 'User Service Delete Failed');
        //TODO:  Log Error
        user.setInvalid('Failed to Delete');
        self.emit('invalid', user);
      }
      self.emit('send-user', result);
    });
  }

  // Create an Okay Result
  var itemOk = function(data) {
    var result = new ServiceResult();
    result.success = true;
    result.message = "All Good";
    result.data = data;

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad REsult
  var userNotOk = function(user) {
    var result = new ServiceResult();
    result.success = false;
    result.message = user.message;
    if(continueWith) {
      continueWith(null, result);
    }
  };


  self.create = function(postedUser, done){
    continueWith = done;
    var user = new User(postedUser);
    user.id = uuid.v4();

    db.connect(config.mongo, function(err, db) {
      if(err) {
        var error = new Verror(err, 'Failed to Connect to DB');
        user.setInvalid('Server Error has occured');
        self.emit('invalid', user);
      }
      self.emit('create', user);
    });
  };


  self.read = function(user, done) {
    continueWith = done;
    db.connect(config.mongo, function(err, db) {
      if(err) {
        var error = new Verror(err, 'Failed to Connect to DB');
        user.setInvalid('Server Error has occured');
        self.emit('invalid', user);
      }
      self.emit('read-user', user);
    });
  }


  self.update = function(user, done) {
    continueWith = done;
    db.connect(config.mongo, function(err, db) {
      if(err) {
        var error = new Verror(err, 'Failed to Connect to DB');
        user.setInvalid('Server Error has occured');
        self.emit('invalid', user);
      }
      self.emit('update-user', user);
    });
  }


  self.delete = function(user, done) {
    continueWith = done;

    db.connect(config.mongo, function(err, db) {
      if(err) {
        var error = new Verror(err, 'Failed to Connect to DB');
        user.setInvalid('Server Error has occured');
        self.emit('invalid', user);
      }
      self.emit('delete-user', user);
    });
  }


  self.list = function(params, done){
    continueWith = done;
    self.emit('send-user');
  }


  self.search = function(params, done){
    continueWith = done;

  }

  //event wiring
  self.on("create", validateUser);
  self.on("valid", checkIfUserExists);
  self.on("create-user", createUser);
  self.on('read-user', readUser);
  self.on('update-user', updateUser);
  self.on('delete-user', deleteUser);
  self.on("send-user", itemOk);

  //Error Event
  self.on("invalid", userNotOk);

  return self;
};

util.inherits(UserService,Emitter);
module.exports = UserService;
