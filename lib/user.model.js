'use strict';

var User = function(args) {
  var user = {};

  if(args.id) { user.id = args.id; }

  user.userName = args.userName;
  user.email = args.email || null;
  user.firstName = args.firstName || null;
  user.lastName = args.lastName || null;
  user.password = args.password;
  user.status = 'pending';

  user.isValid = function() {
    return user.status = 'valid';
  };

  user.isInvalid = function() {
    return !isValid();
  };

  user.setInvalid = function(message) {
    user.status = 'invalid';
    user.message = message;
  };

  user.setValid = function(message) {
    user.status = 'valid';
  }

  return user;
};

module.exports = User;
