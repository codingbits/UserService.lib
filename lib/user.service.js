'use strict';

var Emitter = require('events').EventEmitter;
var util = require('util');
var uuid = require('node-uuid');
var db = require('mongoDAL');
var Verror = require('verror');
var log = require('debug')('UserService');

var UserService = function(config, UserModel) {
  Emitter.call(this);
  var self = this;
  var continueWith = null;

  // Validate Service Input
  if(!config) {
    config = {};
    config.mongo = {};
    config.mongo.url = process.env.MONGO_URL || 'mongodb://127.0.0.1/?test';
  }
  if(!UserModel) UserModel = require('./user.model.js');


  // Validate Input Object
  var validateInput = function(user){
    if(!user._status) { user._status = 'pending'; } // Add Hidden Property
    if(!user._message) { user._message = ''; } // Add Hidden Property

    // Add Hidden Functions
    user.setValid = function() {
      user._status = 'valid';
    };
    user.setInvalid = function(message) {
      user._status = 'invalid';
      user._message = message;
    };

    if(!user.email) {
      self.emit('send-error', null, 'Email is required');
    } else {
      if(!user.id) { user.id = uuid.v4(); }  // Default set the ID.
      if(!user.userName) { user.userName = user.email; } // Default set userName
      if(!user.password) { user.password = ''; }  // Default set the password
      user.setValid();
      self.emit('check-exist', user);
    }
  };

  // Check against the DB to make sure the email doesn't already exist.
  var checkExist = function(user) {
    db.users.exists({ email: user.email }, function(err, exists) {
      if(err) {
        self.emit('send-error', err, 'Failed to Save User');
      }
      if(exists) {
        self.emit('send-error', null, 'Duplicate User');
      } else{
        self.emit('create-user', user);
      }
    });
  };

  // Check the DB and count the users that exist.
  var countUsers = function(params) {
    db.users.length(function(err, length){
      if(err) {
        self.emit('send-error', err, 'Failed to Get User Count');
      } else if(length === 0) {
        self.emit('send-data', new require('./pageResult.model'));
      } else {
        self.emit('list-users', params);
      }
    });
  };

  // Save the User to the Database.
  var createUser = function(user) {
    delete user._status;
    delete user._message;

    db.users.saveData(user, function(err, result){
      if(err) {
        self.emit('send-error', err, 'Failed to Create User');
      } else {
        self.emit('send-data', result);
      }
    });
  };

  // Retrieve the First user from the Database.
  var readUser = function(user) {
    db.users.first(user, function(err, result) {
      if(err) {
        self.emit('send-error', err, 'Failed to Read User');
      } else {
        self.emit('send-data', result);
      }
    });
  };

  // Update the user from the Database
  var updateUser = function(user) {
    delete user._status;
    delete user._message;

    db.users.updateOnly(user, user.id, function(err, result){
      if(err || !result) {
        self.emit('send-error', err, 'Failed to Update User');
      } else {
        self.emit('send-data', user);
      }
    });
  };

  // Delete the user from the Database
  var deleteUser = function(user) {
    db.users.destroy(user.id, function(err, result) {
      if(err) {
        self.emit('send-error', err, 'Failed to Delete User');
      } else {
        self.emit('send-data', result);
      }
    });
  };

  // Get User List from the Database
  var listUsers = function(params) {
    var pageResult = new require('./pageResult.model');
    pageResult.currentPage = parseInt(params.pageIndex);

    var filter = {
      query: {},
      limit: parseInt(params.pageSize) || 10,
      skip: (params.pageSize) * parseInt(params.pageIndex) || 0
    };

    db.users.paginationQuery(filter, function(err, result) {
      if(err) {
        self.emit('send-error', err, 'Failed to Delete User');
      } else {
        pageResult.list = result;
        self.emit('send-data', pageResult);
      }
    });
  };

  // Create an Okay Result
  var sendData = function(data) {
    var result = new require('./serviceResult.model');
    result.success = true;
    result.message = 'All Good';
    result.data = data;

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad Result
  var sendError = function(err, message) {
    var result = new require('./serviceResult.model');
    result.success = false;
    result.message = message;
    if(err) {
      var error = new Verror(err, message);
      log('Failure: ' + JSON.stringify(error, null, 2));
    }
    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Open Database Connection and emit eventHander
  var openConnection = function(input, eventHandler) {
    db.connect(config.mongo, function(err) {
      if(err) {
        self.emit('send-error', err, 'Database Connection Failure');
      } else {
        self.emit(eventHandler, input);
      }
    });
  };

/////////////////////////////////////////

  self.create = function(user, done){
    continueWith = done;
    openConnection(new UserModel(user), 'validate-input');
  };

  self.read = function(user, done) {
    continueWith = done;
    openConnection(user, 'read-user');
  };

  self.update = function(user, done) {
    continueWith = done;
    openConnection(user, 'update-user');
  };

  self.delete = function(user, done) {
    continueWith = done;
    openConnection(user, 'delete-user');
  };

  self.list = function(params, done){
    continueWith = done;
    openConnection(params, 'count-users');
  };

  self.search = function(params, done){
    continueWith = done;
  };

  self.on('validate-input', validateInput);
  self.on('check-exist', checkExist);
  self.on('create-user', createUser);
  self.on('read-user', readUser);
  self.on('update-user', updateUser);
  self.on('delete-user', deleteUser);
  self.on('count-users', countUsers);
  self.on('list-users', listUsers);
  self.on('send-data', sendData);
  self.on('send-error', sendError);

  return self;
};

util.inherits(UserService,Emitter);
module.exports = UserService;
