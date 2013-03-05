# Intro to Class Warfare

## Glen Zangirolami

## @glenbot

### Python Meetup 8.21.2012

---

# Types and Objects

* __Every__ piece of data in Python is an object
* Objects have an identity or __type__ (its class)
* __type__ describes the internal representation of an object as well as methods and operations
* __type__ checking is done with isinstance(object, type)
* All objects are reference counted. When reference count reaches zero it is garbage collected.
* All objects are "First-class". No restrictions in objects use.

Every piece of data is an object:

    !python
    print 3 .__doc__

# Presenter Notes

* isinstance is aware of inheritance. isinstance is heavy.
* is instance doesn't always work, an object that functions like a list but doesn't inherit from list type
* Circular dependencies will cause reference counts to not reach zero. Cycle detector in interpreter.


---

# Built-in types

* None
* int
* long
* float
* complex
* bool
* str
* unicode
* list
* tuple
* xrange
* dict
* set, frozenset.

---

# Classes

* classes are defined with the __class__ keyword
* New-style classes inherit from __object__
* classes are use to create new kinds of objects
* classes define functions (methods), variables (class variables), and computed attributes (properties). All of these are called attributes
* classes have their own namespace but references to class variables must be fully qualified. eg. self.hello_world

Example:

    !python
    class Meetup(object):
        def __init__(self, time, presenter):
            self.time = time
            self.presenter = presenter

# Presenter Notes

* New-style classes were created at Python 2.2. It's an attempt to unify classes. All derived from built-in type. Brings in __new__, metaclasses, descriptors, __getattr__

---

# Class Inheritance

* Modifies the behavior of a class
* Parent class is called a _"base class"_ or _superclass_
* Child class is called a _subclass_

Example:

    !python
    class Meetup(object):
        def __init__(self, time, presenter):
            self.time = time
            self.presenter = presenter
        def get_location(self, x, y):
            return Address(x, y)

    class PythonMeetup(Meetup):
        def __init__(self, time, presenter):
            super(PythonMeetup, self).__init__(time, presenter)
            self.meetup_type = 'Python'

    class DjangoMeetup(PythonMeetup):
        def __init__(self, time, presenter):
            super(PerlMeetup, self).__init__(time, presenter)
            self.meetup_type = 'Django'
            self.location = PythonMeetup.get_location(x, y)

# Presenter Notes
* super(cls, instance) more clearly defines that you are searching for a method in a baseclass

---

# Class Inheritance … super

* _super(cls, instance)_ lets a user know that you are searching for a methods on a base class and calling it
* Someone might think .. "Was PythonMeetup supposed to implement get_location?"

Previous example is better written:

    !python
    class Meetup(object):
        def __init__(self, time, presenter):
            self.time = time
            self.presenter = presenter
        def get_location(self, x, y):
            return Address(x, y)

    class PythonMeetup(Meetup):
        def __init__(self, time, presenter):
            super(PythonMeetup, self).__init__(time, presenter)
            self.meetup_type = 'Python'

    class DjangoMeetup(PythonMeetup):
        def __init__(self, time, presenter):
            super(PerlMeetup, self).__init__(time, presenter)
            self.meetup_type = 'Django'
            self.location = super(DjangoMeetup, self).get_location(x, y)

---

# Class Inheritance

* Stay away from multiple inheritance please
* Classes are ordered from "most specialized" to "least specialized"
* If you need to find how method gets resolved use Class.\_\_mro\_\_ where __mro__ == "method resolution order"

Example:

    !python
    class Remote(TV, Radio, Stereo):
        pass

Method resolution order:

    >>> Remote.__mro__
    (<class '__main__.Remote'>,
    <class '__main__.TV'>,
    <class '__main__.Radio'>,
    <class '__main__.Stereo'>,
    <class '__main__.Electronics'>,
    <type 'object'>)

# Presenter Notes

* If a class inherits it's considered more "specialized" because it specializes in itself and the base class

Python determines the precedence of types (or the order in which they should be placed in any __mro__) from two kinds of constraints specified by the user:

If A is a superclass of B, then B has precedence over A. Or, B should always appear before A in all __mro__s (that contain both). In short let's denote this as B > A.

If C appears before D in the list of bases in a class statement (eg. class Z(C,D):), then C > D.

In addition, to avoid being ambiguous, Python adheres to the following principle:

If E > F in one scenario (or one __mro__), then it should be that E > F in all scenarios (or all __mro__s).

---

# Polymorphism

* Fancy word for dynamic binding or duck typing
* When a method or attribute is called on a class, Python doesn't care what or where it is. It finds it using the \_\_mro\_\_. You do not have to know an objects type.
* In other words, "If it looks like, quacks like, and walks like a duck, then it must be a duck"
* Creating new objects that look and act like an existing object can be used to create loosely coupled interfaces.

---

# Static Methods

* A function living in a class namespace
* Useful on classes that need to be created in many different ways
* Defined with the decorator _@staticmethod_

Example:

    !python
    class SuperCar(object):
        def __init__(self, kind, horsepower, weight):
            self.kind = kind
            self.horsepower = horsepower
            self.weight = weight
        @staticmethod
        def rallysport():
            return SuperCar("camaro", 250, 4000)
        @staticmethod
        def veryon():
            return SuperCar("bugatti", 1200, 3800)

Example:

    >>> veryon = SuperCar.veryon()
    >>> SuperCar.rallysport
    <function c at 0x108a28668>

---

# Class Methods

* Class methods operate on the class itself as an object
* The first parameter by convention is _cls_
* Returns an instance of the class
* Like a factory
* Defined with decorator _@classmethod_

Displaying incorrect class (from previous example):

     >>> class RediculousCar(SuperCar):
     ...     pass
     ... 
     >>> RediculousCar.rallysport()
     <__main__.SuperCar object at 0x426fd0>

Let's fix this!

---

# Class Methods
    
    !python
    class SuperCar(object):
        def __init__(self, kind, horsepower, weight):
            self.kind = kind
            self.horsepower = horsepower
            self.weight = weight
        @classmethod
        def rallysport(cls):
            return cls("camaro", 250, 4000)
        @classmethod
        def veryon(cls):
            return cls("bugatti", 1200, 3800)

Example:

    >>> class RediculousCar(SuperCar):
    ...   pass
    ... 
    >>> RediculousCar.rallysport()
    <__main__.RediculousCar object at 0x42a1d0>

# Presenter Notes

static and class methods operate in the same namespace as instance methods. Can get confusing.

---

# Properties

* Computes it's value when accessed
* Defined with the @property decorator

Example:

    !python
    class Square(object):
        def __init__(self, length, width):
            self.length = length
            self.width = width
        @property
        def area(self):
            return self.length * self.width

Example:

    >>> square = Square(3.0, 5.0)
    >>> square.length
    3.0
    >>> square.width
    5.0
    >>> square.area
    15.0

---

# Properties

* Properties also have setter and deleter

Example:

    !python
    class RestrictedBall(object)
        def __init__(self, circumference):
            self.__circumference = circumference
        @property
        def circumference(self):
            return self.__circumference
        @circumference.setter
        def circumference(self, value):
            if value > 100:
                self.__circumference = 100
            self.__circumference = value
        @circumference.deleter
        def circumference(self):
            raise TypeError("Can't delete circumference")

---

# Descriptors

* Any object that defines \_\_get\_\_, \_\_set\_\_, or \_\_delete\_\_

Example:

    !python
    class SuperPower(object):
        def __init__(self, super_power):
            self.super_power = super_power
        def __get__(self, instance, cls):
            return getattr(instance, self.super_power, 'lightning bolts')
        def __set__(self, instance, value):
            if value not in ['lightining bolts', 'roundhouse kick', 'inflict pain']:
                raise AttributeError('You can\'t give a crappy super powers')
            setattr(instance, self.super_power, value)
        def __delete__(self, instance):
            raise AttributeError("Cannot remove super powers")


    class Walker(object):
        super_power = SuperPower('inflict pain')
---

# Descriptors

Example:

    >>> w = Walker()
    >>> w.super_power
    'lightning bolts'
    >>> w.super_power = 'shoots carebears'
    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    File "<stdin>", line 8, in __set__
    AttributeError: You can't give a crappy super powers
    >>> w.super_power = 'roundhouse kick'
    >>> del w.super_power
    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    File "<stdin>", line 11, in __delete__
    AttributeError: Cannot remove super powers

---

# Attribute Binding

* Attributes are implemented using a dictionary
* New attributes can be added to an instance at any time
* Instances are linked to their class with \_\_class\_\_

Example:

    !python
    class Pencil(object):
        def __init__(self):
            self.weight = 1.0
        @property
        def is_new(self):
            if self.weight < 1.0:
                return False
            return True
        def sharpen(self):
            self.weight -= 1.0

---

# Attribute Binding

Example:

    >>> p = Pencil()
    >>> p.__dict__
    {'weight': 1.0}
    >>> p.__class__
    <class '__main__.Pencil'>
    >>> p.has_lead = True
    >>> p.__dict__
    {'has_lead': True, 'weight': 1.0}
    >>> Pencil.__dict__
    <dictproxy object at 0x4293f0>
    >>> Pencil.__dict__.keys()
    ['__module__', 'is_new', '__dict__', 'sharpen', '__weakref__', '__doc__', '__init__']

# Presenter Notes

dictproxy acts as a proxy to assigning methods to a class. If you try to assign a method to the class without using setattr it will scream

---

# Slots

* Restricts attribute names that can be defined on an instance
* Defined with \_\_slots\_\_
* Performance is much better because class attribute are mapped to an array like structure
* Caveat: Subclasses must define \_\_slots\_\_ too

Example:

    !python
    class Glass(object):
        __slots__ = ('liquid',)
        def __init__(self, liquid):
            self.liquid = liquid

---

# Slots

Example:

    >>> glass = Glass('root beer')
    >>> glass.__dict__
    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    AttributeError: 'Glass' object has no attribute '__dict__'
    >>> glass.color = 'Blue'
    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    AttributeError: 'Glass' object has no attribute 'color'

---

### Operator Overloading

* Implements special methods such as \_\_repr\_\_, \_\_len\_\_, and \_\_add\_\_

Example:

    !python
    class DupeList(object):
        def __init__(self, *objects):
            self.l = list(objects)
        def __len__(self):
            return len(self.l)
        def __add__(self, object):
            new_list = []
            new_list.extend(self.l)
            new_list.extend(object.l)
            return DupeList(*new_list)
        def __str__(self):
            return '%s' % self.l
        def __repr__(self):
            return '<DupeList %s>' % self.l

---

# Operator Overloading

Example:

    >>> list1 = DupeList(1,2,3)
    >>> list1
    <DupeList [1, 2, 3]>
    >>> print list1
    [1, 2, 3]
    >>> list2 = DupeList(4,5,6)
    >>> list3 = list1 + list2
    >>> list3
    <DupeList [1, 2, 3, 4, 5, 6]>
    >>> len(list3)
    6

---

# Abstract Classes

* Organize objects into hierarchy
* Use the abc module ABCMeta, @abstactmethod, @abstractproperty
* use \_\_metaclass\_\_ to create abstract class
* @abstactmethod implements required subclass methods
* @abstractproperty implements required subclass properties
* Registering a subclass will allow type checking involving the base class

Example:

    !python
    from abc import ABCMeta, abstractmethod, abstractproperty
    class FollowMe:
        __metaclass__ = ABCMeta
        @abstractmethod
        def required_method(self):
            pass
        @abstractproperty
        def required_property(self):
            pass

---

# Abstract Classes

Example:

    >>> class WontFollow(FollowMe):
    ...   pass
    ... 
    >>> w = WontFollow()
    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    TypeError: Can't instantiate abstract class WontFollow with abstract methods required_method, required_property
    >>> FollowMe.register(WontFollow)

---

# Abstact Classes

Example:

    >>> class WillFollow(FollowMe):
    ...   def required_property(self):
    ...     pass
    ...   def required_method(self):
    ...     pass
    ... 
    >>> w = WillFollow()
    >>> FollowMe.register(WillFollow)
    >>> issubclass(WillFollow, FollowMe)
    True
    >>> isinstance(w, FollowMe)
    True

---

# Meta Classes

* A metaclass is an object that knows how to create and manage classes
* Meta classes are used in frameworks to have control over user-defined objects
* Can alter the contents and definition prior to creation of a class

Example:

    >>> class Meetup(object):
    ...   pass
    ... 
    >>> isinstance(Meetup, object)
    True

How did this happen? Metaclasses!

---

# Meta Classes

Example:

    >>> class_name = "Meetup"
    >>> class_parents = (object,)
    >>> class_body = """
    ... def __init__(self):
    ...   pass
    ... """
    >>> class_dict = {}
    >>> exec(class_body, globals(), class_dict)
    >>> Meetup = type(class_name, class_parents, class_dict)
    >>> Meetup
    <class '__main__.Meetup'>
    >>> type(Meetup)
    <type 'type'>

# Presenter Notes

looks for \_\_metaclass\_\_ in the scope. If it doesn't find it, it then uses type as it's metaclass

---

# Meta Classes

Example:
	
    !python
    class User(type):
        def __new__(cls, name, bases, dict):
            if 'user' not in name.lower():
                raise NameError('User must be in the class name')
            return type.__new__(cls, name, bases, dict)

Example:

    >>> class Person(object):
    ...     __metaclass__ = User
    ... 
    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    File "<stdin>", line 4, in __new__
    NameError: User must be in the class name
    >>> class MeetupUser(object):
    ...   __metaclass__ = User
    ... 
    >>> 

---

# Class Decorator

* A function that takes a class as a parameter and returns a class
* Can use instead of meta classes to do extra processing after a class is defined

Example:

    !python
    def repr(self):
        return '<Class %s in %s>' % (
            self.__class__.__name__,
            self.__module__
        )

    def unified_repr(cls):
        cls.__repr__ = repr
        return cls 

Example:

     >>> @unified_repr
     ... class Meetup(object):
     ...   pass
     ... 
     >>> m = Meetup()
     >>> m
     <Class Meetup in __main__>

---

# Thank you!

## Any questions or comments?

## Glen Zangirolami @glenbot

## References

* Python Essential Reference (4th Edition)
* [http://docs.python.org/library/abc.html](http://docs.python.org/library/abc.html)
* [http://en.wikipedia.org/wiki/Polymorphism_in_object- oriented_programming](http://en.wikipedia.org/wiki/Polymorphism_in_object- oriented_programming)
* [http://www.rafekettler.com/magicmethods.html](http://www.rafekettler.com/magicmethods.html)



    

    








    

