# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, \
    login as login_user, \
    logout as logout_user


@login_required
def index(request):
    return render(request, 'index.html')


def login(request):
    # check for a login
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)

        if user:
            login_user(request, user)
            return redirect('frontend.index')

    return render(request, 'login.html')


def logout(request):
    logout_user(request)
    return redirect('frontend.login')
