from django.conf.urls import patterns, include
from tastypie.api import Api
from posts.api import UserResource, PostResource

v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(PostResource())


urlpatterns = patterns('',
    (r'^api/', include(v1_api.urls)),
    (r'^', include('frontend.urls')),
)
