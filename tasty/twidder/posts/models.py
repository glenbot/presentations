from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Post(models.Model):
    body = models.TextField()
    create_dt = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User)
