require.paths.unshift(__dirname + '/../');

var mysql = require('mysqlobjects');
var assert = require('assert');

exports.testMySqlSavesAndLoadsPost = function(test)
{
  mysql.initialize({ database: 'test', username: 'test', password: 'test' });
  var post = new mysql.Post('test', 'Hello');

  post.save(function(ok)
  {
    assert.ok(ok);

    mysql.Post.load('test', function(post)
    {
      assert.ok(post.text == 'Hello');
      test.done();
    });
  });
}
