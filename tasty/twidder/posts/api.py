from django.contrib.auth.models import User
from tastypie import fields
from tastypie.resources import ModelResource, ALL
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import DjangoAuthorization
from posts.models import Post


class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        excludes = ['email', 'password', 'is_active', 'is_staff', 'is_superuser']
        filtering = {
            'username': ALL,
        }
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()


class PostResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=True)

    class Meta:
        queryset = Post.objects.all().order_by('-create_dt')
        resource_name = 'post'
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()
        list_allowed_methods = ['get', 'post', 'put']
        always_return_data = True
        limit = 10
