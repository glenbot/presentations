var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox');

var App = Ember.Application.create({
  rootElement: '#content'
});

/**
* Application
*/
ApplicationController = Ember.Controller.extend();
App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

/**
* Storage and Datasources
*/
App.DataSource = Ember.Object.create({
  _make_call: function(endpoint, token, params, callback, type) {
    var ajax_options = {
      url: endpoint,
      type: type,
      success: function(data) {
        callback(data);
      }
    };

    // stringify the params
    if (params) {
      if (token) ajax_options['headers'] = { 'X-CSRFToken': token };
      ajax_options['contentType'] = 'application/json; charset=utf-8';
      ajax_options['data'] = JSON.stringify(params);
    }

    $.ajax(ajax_options);  
  },
  get: function(endpoint, callback, params, token) {
    this._make_call(endpoint, token, params, callback, 'get');
  },
  post: function(endpoint, callback, params, token) {
    this._make_call(endpoint, token, params, callback, 'post');
  },
  put: function(endpoint, callback, params, token) {
    this._make_call(endpoint, token, params, callback, 'put');
  },
  delete: function(endpoint, callback, params, token) {
    this._make_call(endpoint, token, params, callback, 'delete');
  }
});


/**
* Models
*/
App.Post = Ember.Object.extend({
  body: '',
  create_dt: null,
  user: null,
  href: function() {
    // setup the correct route for post detail
    var id = this.get('id');
    return "#/post/%@".fmt(id);
  }.property('id'),
  date: function() {
    var date = null;

    // replace the T that comes back from python datetime
    // strings to it can be formatted using javascript correctly
    if (is_firefox > -1) {
      date = new Date(this.get('create_dt')).format("dddd, mmmm dS, yyyy, h:MM:ss TT");
    } else {
      date = new Date(this.get('create_dt').replace('T', ' ')).format("dddd, mmmm dS, yyyy, h:MM:ss TT");
    }

    return date;
  }.property('create_date')
});

App.User = Ember.Object.extend({
  username: ''
});

/**
* Views
*/
App.PostsView = Ember.View.extend({});

/**
* Controllers
*/
App.PostsController = Ember.ArrayController.extend({
  content: [],
  post_body: '',
  meta: null,
  post_body_count: function() {
    var post_body = this.get('post_body');

    return post_body.length; 
  }.property('post_body'),
  should_load_more: function() {
    // boolean test to see if we should show the
    // load more button
    var meta = this.get('meta');

    if (meta.next) return true;
    return false;
  }.property('meta.next'),
  insert: function() {
    var _this = this;

    // check to see if scope is textarea
    // if it is, change the context to the controller
    // this feels hacky :/
    if (_this.constructor == Ember.TextArea)
      _this = _this._context;

    // populate post params
    var csrf_token = $('input[name="csrfmiddlewaretoken"]').val();
    var value = _this.get('post_body');
    var params = {
      body: value,
      user: '/api/v1/user/%@/'.fmt(application_user.get('id'))
    };

    // create post
    App.DataSource.post('api/v1/post/', function(data) {
      var post = App.Post.create(data)
      _this.insertAt(0, post);

      // reset the post_body so the input box clears
      _this.set('post_body', '');
    }, params, csrf_token);
  },
  delete: function(post) {
    var _this = this;
    var csrf_token = $('input[name="csrfmiddlewaretoken"]').val();

    // delete post
    App.DataSource.delete('api/v1/post/%@/'.fmt(post.get('id')), function(data) {
      _this.removeObject(post);
    }, {}, csrf_token);  
  },
  load_more: function() {
    var meta = this.get('meta');
    var _this = this;

    // get the next posts
    App.DataSource.get(meta.next, function(data) {
      // set the meta information of the posts
      // so that we can paginate
      _this.set('meta', data.meta);

      // load all the posts
      data.objects.forEach(function(item) {
        var post = App.Post.create(item)
        _this.pushObject(post);
      });
    });
  }
});

/**
* Routing
*/
App.Router.map(function(match) {
  this.route('posts', { path: '/' });
  this.route('post', { path: '/post/:post_id' });
});

App.PostsRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    // Even though content is set on the controller
    // ember requires that you set it again, WTF
    controller.set('content', []);

    // get all post and assign to the controller
    App.DataSource.get('api/v1/post/', function(data) {
      if (data) {
        // set the meta information of the posts
        // so that we can paginate
        controller.set('meta', data.meta);

        // load all the posts
        data.objects.forEach(function(item) {
          var post = App.Post.create(item)
          controller.pushObject(post);
        });
      }
    });
  }
});

App.PostRoute = Ember.Route.extend({
  model: function(params) {
    var _this = this;

    // set the controllers model
    App.DataSource.get('api/v1/post/%@/'.fmt(params.post_id), function(data) {
      _this.controller.set('model', App.Post.create(data));
    });
  }
});

App.initialize();

/* Handlebar Helpers */
Ember.Handlebars.registerBoundHelper('explosivo', function(text) {
  var link_pattern = new RegExp("((http|https)://[^\\s]+)", "igm");
  var text = Handlebars.Utils.escapeExpression(text);

  // get itemized version of the link
  itemized_link = link_pattern.exec(text);

  if (itemized_link) {
    // check for a youtube video and embed the link
    if (itemized_link[1].indexOf('youtube.com') > -1) {
      var youtube_pattern = new RegExp("watch\\?v=(.*)", "ig");
      var embedd = '<div><iframe width="420" height="315" src="%@" frameborder="0" allowfullscreen></iframe></div>';

      // get YouTubes link hash so we can restructure the link
      var link_hash = youtube_pattern.exec(itemized_link[1]);
      var embedd_link = 'http://youtube.com/embed/%@'.fmt(link_hash[1]);

      text = text.replace(itemized_link[1], embedd.fmt(embedd_link));
    } else {
      text = text.replace(itemized_link[1], '<a href="%@">%@</a>'.fmt(itemized_link[1], itemized_link[1]));
    }
  }

  return new Handlebars.SafeString(text);
});
