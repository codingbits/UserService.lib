/* jshint -W024, -W101, -W079, -W098 */
/* jshint expr:true */
'use strict';

var should = require('chai').should();
var UserService = require('../lib/user.service');
var db = require('mongoDAL');
var assert = require('assert');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var config = require('./config.json');

describe('UserService', function() {

  before(function(done){
    db.connect(config.mongo, function(err, db){
      assert.ok(db, err);
      db.dropDb(config.mongo.db, function(){
        db.install(['users'], function(){
          done();
        });
      });
    });
  });

  describe('Create User', function() {
    var userService = new UserService(config);
    var dto = require('./user.json');
    var user = null;

    it('Creates a User and returns success with a user', function(done) {
      userService.create(dto, function(err, result) {
        result.success.should.be.true;
        user = result.data;
        user.should.not.be.equal(null);
        done();
      });
    });
    it('Defines a Property Id', function(done) {
      (user.id === null).should.be.false;
      done();
    });
    it('Defines a Property Email', function(done) {
      (user.email === null).should.be.false;
      done();
    });
    it('Defines a Property UserName', function(done) {
      (user.username === null).should.be.false;
      done();
    });
    it('Defines a Property FirstName', function(done) {
      (user.firstName === null).should.be.false;
      done();
    });
    it('Defines a Property LastName', function(done) {
      (user.lastName === null).should.be.false;
      done();
    });
    it('Defines a Property Password', function(done) {
      (user.password === null).should.be.false;
      user.password.should.not.equal(dto.password);
      var match = bcrypt.compareSync(dto.password, user.password); // false
      match.should.be.true;
      done();
    });
    after(function(done){
      db.users.destroy(user.id, function(err, result) {
        assert.ok(err === null, result);
        done();
      });
    });
  });

  describe('Custom User Model', function() {
    var userService = new UserService(config);
    var dto = {};
    dto.email = 'test@mail.com';
    dto.name = 'Test User';

    var user = null;

    it('Creates a User and returns success with a user', function(done) {
      userService.create(dto, function(err, result) {
        result.success.should.be.true;
        user = result.data;
        user.should.not.be.equal(null);
        done();
      });
    });
    it('Defines a Property Id', function(done) {
      (user.id === null).should.be.false;
      done();
    });
    it('Defines a Property Email', function(done) {
      (user.email === null).should.be.false;
      done();
    });
    it('Defines a Property UserName', function(done) {
      (user.username === null).should.be.false;
      done();
    });
    it('Defines a Property Name', function(done) {
      (user.name === null).should.be.false;
      done();
    });
    after(function(done){
      db.users.destroy(user.id, function(err, result) {
        assert.ok(err === null, result);
        done();
      });
    });
  });

  describe('Read User', function() {
    var userService = new UserService(config);
    var dto = require('./user.json');
    var user = null;

    before(function(done){
      userService.create(dto, function(err, result) {
        user = result.data;
        done();
      });
    });
    it('Retrieves an item by userName', function(done) {
      var params = { userName: user.userName };
      userService.read(params, function(err, result) {
        (err === null).should.be.true;
        result.success.should.be.true;
        done();
      });
    });
    after(function(done){
      db.users.destroy(user.id, function(err, result) {
        assert.ok(err === null, result);
        done();
      });
    });
  });

  describe('Update User', function() {
    var userService = new UserService(config);
    var dto = require('./user.json');
    var user = null;

    beforeEach(function(done) {
      userService.create(dto, function(err, result) {
        assert.ok(result.success, result.message);
        user = result.data;
        done();
      });
    });
    it('Updates an item by Id', function(done) {
      user.firstName = 'ChangedFirst';
      user.lastName = 'ChangedLast';

      userService.update(user, function(err, result) {
        result.success.should.be.true;
        result.data.firstName.should.equal(user.firstName);
        result.data.lastName.should.equal(user.lastName);
        done();
      });
    });
    after(function(done){
      db.users.destroy(user.id, function(err, result) {
        assert.ok(err === null, result);
        done();
      });
    });
  });

  describe('Delete User', function() {
    var userService = new UserService(config);
    var dto = require('./user.json');
    var user = null;

    beforeEach(function(done) {
      userService.create(dto, function(err, result) {
        assert.ok(result.success, result.message);
        user = result.data;
        done();
      });
    });
    it('Deletes an item by Id', function(done) {
      userService.delete(user, function(err, result) {
        result.success.should.be.true;
        done();
      });
    });
  });

  describe('User List', function() {
    var userService = new UserService(config);
    var dto = require('./user.json');
    var user = null;

    before(function(done) {
      userService.create(dto, function(err, result) {
        assert.ok(result.success, result.message);
        user = result.data;
        done();
      });
    });
    it('should respond with a JSON Object with Users as an Array', function(done) {
      userService.list({pageSize: 5, pageIndex: 0}, function(err, result) {
        result.success.should.be.true;
        result.data.list.should.be.instanceof(Array);
        result.data.list.should.have.length(1);
        user = result.data.list[0];
        done();
      });
    });
    it('Defines a Property Id', function(done) {
      (user.id === null).should.be.false;
      done();
    });
    it('Defines a Property Email', function(done) {
      user.should.have.property('email', dto.email);
      done();
    });
    it('Defines a Property UserName', function(done) {
      user.should.have.property('userName', dto.userName);
      done();
    });
    it('Defines a Property FirstName', function(done) {
      user.should.have.property('firstName', dto.firstName);
      done();
    });
    it('Defines a Property LastName', function(done) {
      user.should.have.property('lastName', dto.lastName);
      done();
    });
    after(function(done){
      db.users.destroy(user.id, function(err, result) {
        assert.ok(err === null, result);
        done();
      });
    });
  });

  describe('User Search', function() {
    var userService = new UserService(config);
    var dto = require('./user.json');
    var dto2 = {'email': 'test2@mail.com'};

    var user1 = null;
    var user2 = null;

    before(function(done) {
      userService.create(dto, function(err, result) {
        assert.ok(result.success, result.message);
        user1 = result.data;
        userService.create(dto2, function(err, result) {
          user2 = result.data;
          done();
        });
      });
    });

    it('Should find a user by email', function(done) {
      userService.search({'email': 'test2'}, function(err, result) {
        result.data.list.length.should.equal(1);
        done();
      });
    });

    after(function(done){
      db.users.destroy(user1.id, function(err, result) {
        assert.ok(err === null, result);

        db.users.destroy(user2.id, function(err, result) {
          assert.ok(err === null, result);
          done();
        });

      });
    });

  });
});

