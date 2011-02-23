# Persist

Persist is an ultra-simple persistence framework for JavaScript.
It originates from the common need for very simple, key-based 
persistence of objects. Its extensible nature allows quick and
easy implementation of backends (known as repositories).

Currently supported repositories:
 - CouchDB
 - MySQL

## Using Persist

Start off defining an object:

    function Post(id, text)
    {
        this.id = id;
        this.text = text;
    }

Then, define your repository module:

    var RepositoryModule = require('persist').RepositoryModule;

    var module = new RepositoryModule();
    module.addObjects(
    {
        post:
        {
            type: Post,
            injectCrud: true, // Will inject load/save on the object
            key: 'id' // Defines which property is the object key
        }
    });

    module.createExports(exports); // Exports loadPost and savePost,
                                   // and the augmented Post type
                                   
Then, use your persistable model:

    var objects = require('objects'); // Your module

    var post = new objects.Post('test', 'Hello');
    post.save(function(ok)
    {
        if(!ok) throw new Error('Could not save');
    });

    post.load('test', function(obj)
    {
        if(!obj) throw new Error('Could not load');
        // Do stuff to the post
    }
