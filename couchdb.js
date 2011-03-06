var http = require('http');
var https = require('https');
var qs = require('querystring');
var url = require('url');

function createRequest(callback, method, uri, params, headers)
{
  uri = url.parse(uri);

  if(!headers)
  {
    headers = {};
  }

  if(!headers.Host)
  {
    headers.Host = uri.hostname;
  }

  uri.query = qs.parse(uri.query);
  if(!uri.query)
  {
    uri.query = {};
  }

  if(params)
  {
    for(var key in params)
    {
      if(params.hasOwnProperty(key))
      {
        uri.query[key] = params[key];
      }
    }
  }

  var queryString = qs.stringify(uri.query);
  var path = uri.pathname;
  if(queryString)
  {
    path += '?' + queryString;
  }

  var web = (uri.protocol == 'https:' ? https : http);
  var req = web.request(
      {
        method: method,
        host: uri.hostname,
        port: uri.port ? uri.port : (uri.protocol == 'https:' ? 443 : 80),
        headers: headers,
        path: path
      }, function(res)
      {
        var data = '';
        res.on('data', function(chunk)
          {
            data += chunk;
          });
        res.on('end', function()
          {
            callback(null, res.statusCode, res.headers, data);
          });
      })
      .on('error', callback)
      .on('close', callback);

  return req;
}

function get(uri, params, headers, callback)
{
  var req = createRequest(callback, 'GET', uri, params, headers);
  req.end();
}

function put(uri, params, headers, body, callback)
{
  var req = createRequest(callback, 'PUT', uri, params, headers);
  req.end(body);
}

function del(uri, params, headers, callback)
{
  var req = createRequest(callback, 'DELETE', uri, params, headers);
  req.end();
}
var CouchDbRepository = exports.CouchDbRepository = function(options)
{
  this.database = options.database;
  if(this.database.charAt(this.database.length -1) != '/')
  {
    this.database += '/';
  }

  if(options.username && options.password)
  {
    this.authHeaderValue = new Buffer(options.username + ':' + options.password).toString('base64');
  }
};

CouchDbRepository.prototype.get = function(id, callback)
{
  get(
    this.database + '/' + encodeURIComponent(id), // URL
    {}, // Query string parameters
    { 'Accept' : 'application/json',
      'Authorization' : 'Basic ' + this.authHeaderValue }, // Headers
    function(err, statusCode, headers, data)
    {
      if(err)
      {
        callback(null);
      }
      else if(statusCode != 200)
      {
        callback(null);
      }
      else
      {
        callback(JSON.parse(data));
      }
    });
};

CouchDbRepository.prototype.set = function(obj, callback)
{
  var db = this;

  put(
    this.database + encodeURIComponent(obj._id),
    {}, // Query string parameters
    { 'Authorization' : 'Basic ' + this.authHeaderValue }, // Headers
    JSON.stringify(obj),

    function(err, statusCode, headers, data)
    {
      if(err)
      {
        callback(false);
      }
      else if(statusCode == 201 || statusCode == 202)
      {
        obj._rev = data.rev;
        callback(true);
      }
      else if(statusCode == 409)
      {
        db.get(obj._id, function(doc)
          {
            obj._rev = doc._rev;
            db.del(obj, function(ok)
              {
                if(ok)
                {
                  delete obj._rev;
                  db.set(obj, callback);
                }
                else
                {
                  callback(false);
                }
              });
          });
      }
      else
      {
        callback(false);
      }
    });
};

CouchDbRepository.prototype.del = function(obj, callback)
{
  del(
    this.database + encodeURIComponent(obj._id),

    { rev : obj._rev }, // Query string parameters

    { 'Authorization' : 'Basic ' + this.authHeaderValue }, // Headers

    function(err, statusCode, headers, data)
    {
      callback(statusCode == 200 && !err);
    });
};

