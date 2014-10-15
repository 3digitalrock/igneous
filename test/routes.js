var should = require('should'),
    assert = require('assert'),
    request = require('supertest'),
    server = require('../server');

var hippie = require('hippie');

describe('Routing', function() {
    var api = function(){
      return hippie(server)
        .json();
    };
    
    describe('Channel', function() {
        it('should return a channel based on name', function(done){
            api()
                .get('/channels/action')
                .expectStatus(200)
                .end(function(err, res, body) {
                    if (err) throw err;
                    done();
                });
        });
        it('should reject duplicate entry', function(done){
            api()
                .post('/channels')
                .send({name: "Action", description: "Fast-paced stuff"})
                .expectStatus(409)
                .end(function(err, res, body) {
                    if (err) throw err;
                    done();
                });
        });
    });
});