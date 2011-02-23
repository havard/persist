require.paths.unshift(__dirname + '/../');

var RepositoryModule = require('persist').RepositoryModule;
var MySql = require('mysqldb').MySqlRepository;

function Post(id, text)
{
  this.id = id;
  this.text = text;
}

var module = new RepositoryModule();
module.setRepositoryType(MySql);

module.addObjects(
{
  post:
  {
    type: Post,
    injectCrud: true,
    key: 'id'
  }
});

module.createExports(exports);
