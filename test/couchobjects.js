require.paths.unshift(__dirname + '/../');

var RepositoryModule = require('persist').RepositoryModule;
var CouchDb = require('couchdb').CouchDbRepository;

function Post(id, text)
{
  this.id = id;
  this.text = text;
}

var module = new RepositoryModule();
module.setRepositoryType(CouchDb);

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

