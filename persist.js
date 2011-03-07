var RepositoryModule = exports.RepositoryModule = function()
{
  this._types = {};
  this._typeSequenceNumber = 1;
};

RepositoryModule.prototype.setRepositoryType = function(repositoryType)
{
  this.repositoryType = repositoryType;
};

RepositoryModule.prototype.addObjects = function(objects)
{
  for(var objectName in objects)
  {
    if(objects.hasOwnProperty(objectName))
    {
      var settings = objects[objectName];

      this.addObject(objectName, settings);
    }
  }
};

RepositoryModule.prototype.addObject = function(objectName, settings)
{
  var type = settings.type;
  var key = settings.key;

  var module = this;

  var getter = function(id, callback)
  {
    module.repository.get(id, function(loaded)
    {
      if(loaded)
      {
        for(var thing in type.prototype)
        {
          loaded[thing] = type.prototype[thing];
        }
      }
      callback(loaded);
    });
  };

  var setter = function(obj, callback)
  {
    obj._id = obj[key];
    module.repository.set(obj, callback);
  };


  var instance = new type();
  var typename = instance.constructor.name || 'Unknown_Type_#' + this.typeSequenceNumber++;
  RepositoryModule.prototype['get' + typename] = getter;
  RepositoryModule.prototype['set' + typename] = setter;

  if(settings.injectCrud)
  {
    type.prototype.save = function(callback)
    {
      setter(this, callback);
    };

    type.load = function(id, callback)
    {
      getter(id, callback);
    };
  }

  this[typename] = type;
  this._types[typename] = type;
};

RepositoryModule.prototype.initialize = function(options)
{
  this.repository = new this.repositoryType(options);
};

RepositoryModule.prototype.createExports = function(exports)
{
  var module = this;

  for(var typename in this._types)
  {
    if(this._types.hasOwnProperty(typename))
    {
      exports[typename] = this._types[typename];
    }
  }

  exports.initialize = function()
  {
    module.initialize.apply(module, arguments);
  };
};
