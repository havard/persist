var mysql = require('mysql');

var MySqlRepository = exports.MySqlRepository = function(options)
{
  this.database = options.database;

  this.client = new mysql.Client();
  this.client.host = options.hostname || 'localhost';
  this.client.host = options.port || 3306;
  this.client.user = options.username || '';
  this.client.password = options.password || '';

  this.client.connect(function(err)
  {
    if(err) throw err;
  });

  this.client.query('CREATE DATABASE ' + options.database, function(err) 
  {
    if (err && err.number != mysql.Client.ERROR_DB_CREATE_EXISTS) 
    {
      throw err;
    }
  });

  this.client.query('USE ' + options.database, function(err)
  {
    if(err) throw err;
  });
  this.client.query('CREATE TABLE objects (id VARCHAR(255) NOT NULL, ' + 
    'object TEXT NOT NULL, PRIMARY KEY(id))', function(err)
    {
      if(err && err.number != mysql.Client.ERROR_TABLE_EXISTS_ERROR)
      {
        throw err;
      }
    });
};

MySqlRepository.prototype.get = function(id, callback)
{
  this.client.query('SELECT object FROM objects WHERE id=?', [id],
    function(err, results, fields)
    {
      if(err)
      {
        callback(null);
      }
      else
      {
        callback(JSON.parse(results[0].object));
      }
    });
};

MySqlRepository.prototype.set = function(obj, callback)
{
  var db = this;
  this.client.query('INSERT INTO objects VALUES(?, ?)', 
    [obj._id, JSON.stringify(obj)], function(err)
    {
      if(err)
      {
        if(err.number == mysql.Client.ERROR_DUP_ENTRY)
        {
          db.client.query('UPDATE objects SET object=? WHERE id=?', 
            [JSON.stringify(obj), obj._id], function(err)
            {
              callback(!err);
            });
        }
        else
        {
          callback(false);
        }
      }
      else
      {
        callback(true);
      }
    });
};

MySqlRepository.prototype.del = function(obj, callback)
{
  this.client.query('DELETE FROM objects WHERE id=?', [obj._id], function(err)
  {
    callback(!err);
  });
};

