from django.conf.urls.defaults import patterns, url


urlpatterns = patterns('frontend.views',
    url(r'^logout/$', 'logout', name="frontend.logout"),
    url(r'^login/$', 'login', name="frontend.login"),
    url(r'^$', 'index', name="frontend.index"),
)
