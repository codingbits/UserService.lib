/* jshint -W024, -W101, -W079, -W098 */
/* jshint expr:true */
'use strict';

var should = require('chai').should();
var User = require('../lib/user.model');

describe('User', function() {

  var args = {};
  args.id = 1;
  args.userName = 'unitTest';
  args.email = 'mail@test.com';
  args.firstName = 'first';
  args.lastName = 'last';
  var user = new User(args);

  describe('User Defaults', function() {
    it('has an id', function(){
      user.id.should.equal(args.id);
    });
    it('has a userName', function(){
      user.userName.should.equal(args.userName);
    });
    it('has an email', function(){
      user.email.should.equal(args.email);
    });
    it('has a firstName', function(){
      user.firstName.should.equal(args.firstName);
    });
    it('has a lastName', function(){
      user.lastName.should.equal(args.lastName);
    });
  });

});
