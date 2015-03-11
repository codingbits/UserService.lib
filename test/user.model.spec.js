var should = require('chai').should();
var User = require("../lib/user.model");

describe('User', function() {
  var user = new User({
        id: 1,
        userName: "mochaTest",
        email: "mail@test.com",
        firstName: "first",
        lastName: "last"
      });

  describe("User Defaults", function() {
    it("has an id", function(){
      user.id.should.equal(1);
    });
    it("has a userName", function(){
      user.userName.should.equal("mochaTest");
    });
    it("has an email", function(){
      user.userName.should.equal("mochaTest");
    });
    it("has a firstName", function(){
      user.userName.should.equal("mochaTest");
    });
    it("has a lastName", function(){
      user.userName.should.equal("mochaTest");
    });
  });

});
