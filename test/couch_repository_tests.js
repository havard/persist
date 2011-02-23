require.paths.unshift(__dirname);

var couch = require('couchobjects');
var assert = require('assert');

exports.testCouchDBSavesAndLoadsPost = function(test)
{
  couch.initialize({ database: 'https://localhost:5984',
    username: 'test', password: 'test' });
  var post = new couch.Post('test', 'Hello');

  post.save(function(ok)
  {
    assert.ok(ok);

    couch.Post.load('test', function(post)
    {
      assert.ok(post.text == 'Hello');
      test.done();
    });
  });
}
