# Creating RESTful APIs with Django and Tastypie

Glen Zangirolami

glenbot@gmail.com

.fx: titleslide

---

## Why do you need an API?

* You need mobile applications
* Your parnters are asking for one to integrate with
* Your site is getting screen scraped by the Chinese Screenscape Mafia
* Need flexibility in providing content
* APIs improve technical architecture
* You HAVE to make data available

---

## Know thy Customer

* Public API - the data can be accessed by anyone either freely or via authentication
* Private API - Internal Customers or Partners needs access to your data

---

## Business Questions

* Who is the API provider?
* How will the API be published and promotoed?
* Who is the target audience for the API?
* What assets will be provided though the API?
* What types of apps will the API support?
* Who will use the apps created using the API?

---

## API endpoint types

* GET - Get a single item or list of items
* POST - Create an item
* PUT - Update an item
* DELETE - Delete an item

It's a good idea to version your API.


---

## django-tastypie to the rescue

    !bash
    $ pip install django-tastypie

---

## Creating a resource

Place an `api.py` in your application folder.

*django project --> app --> api.py*

Example resource in `api.py`

    !python
    class PostResource(ModelResource):
        class Meta:
            queryset = Post.objects.all()
            resource_name = 'post'
            authentication = SessionAuthentication()
            authorization = DjangoAuthorization()
            list_allowed_methods = ['get', 'post', 'put']
            always_return_data = True

---

## Applying the resource to an endpoint

    !python
    from django.conf.urls import patterns, include
    from tastypie.api import Api
    from posts.api import PostResource

    v1_api = Api(api_name='v1')
    v1_api.register(PostResource())


    urlpatterns = patterns('',
        (r'^api/', include(v1_api.urls)),
        ...
    )

---

## Resources

* Extends `ModelResource` from `tastypie.resources`
* Should provide a queryset
* Should use an authentication method (unless you want the Chinese to kill your server)

---

### Resource meta options
* `queryset` this will be set to `Model.objects.all()` or a more filtered down query
* `resource_name` name your endpoint whatever you would like. Don't call it `boobies` not matter how much urge there is.
* `authentication` - Keys, sessions, etc
* `authorization` - Does this django user have permissions to the model?
* `list_allowed_methods` - limit the endpoint to specific HTTP verbs
* `always_return_data` - will return data on post and put. I don't see any reason not to have this on.

.notes: Many more in documentation such as caching, rate limiting, etc.

---

### Authentication Methods

* `Authentication` read-only and anyone can access!
* `ApiKeyAuthentication` require passing `api_key` with every request
* `SessionAuthentication` use the django session. Will have to pass CSRF token.
* `DigestAuthentication` uses HTTP Digest to check authorization
* `OAuthAuthentication` will check credentials against a different service. Does not implement oAuth.

---

### Authorization Methods

* `Authorization` no permissions weeeeeeeeee!
* `ReadOnlyAuthorization` a little better
* `DjangoAuthorization` uses django permissions model to dictate access

---

## Let's Demo an Application Now

## Questions?

References:

* http://www.amazon.com/APIs-Strategy-Guide-Daniel-Jacobson/dp/1449308929
* http://django-tastypie.readthedocs.org/en/v0.9.12/
* http://mathiasbynens.be/notes/mysql-utf8mb4




