#Creating a Component/Class

To create a new new Component type, you must first create
it's class. 
The sample class provided in the components.js file is Engine

    function Engine(){
        this.initialize.apply(this, arguments)
    }

    Engine.prototype = Object.create(CarComponent.prototype)

    Engine.prototype.intilalize = function(name){
        CarComponent.prototype.initialize.call(this, 'Engine', name)
    }

The above is the bare minimum you would need to create a new type of 
component. The Engine function is the **constructor**, the function
that will be called when someone attempts to create a new Engine()

To ensure your code is compliant with the code written for the rest of 
the simulator, a base class has been provided for any component you
create. This base class is called **CarComponent**. It has it's own
constructor, and is expecting to be passed two arguments when it is 
called. 

In older style JS, if you were writing a child class (like Engine), 
and you still wanted to call the parent class's constructor (CarComponent)
you would use some kind of middle-man. In this case, a method called
**initialize** was created on CarComponent, which is 'called' from 
it's own constructor. 

The long and short of it is this - we do the same on any child 
class we create. In the example above, the next thing we do after
defining the constructor is set the prototype to a copy of CarComponent's prototype - to create the parent-child relationship, and make it so 
our Engine component gets everything CarComponent has. 
To make sure we call the constructor function on CarComponent, we 
make our own initialize method, expecting **all of the arguments that the parent was expecting**, plus any we'd like the child to have. 
We pass along the parent's expected args to it's initialize method, then proceed with our own. 

**All we're doing is calling both constructors. That's all this means**
In modern JS, it's a lot easier, with way less code. But this is important to know, because that 'modern' code is really just calling this kinda stuff in the background for you.

##The install method
All component classes you create must have a method you define called
**install**. Even if the method doesn't do anything, it should exist. 
The install method is where you can do things that require _knowing about the car you're installing the component on_.  If you're trying to write code for a component, and realize you need the Car object this component will eventually be installed on, you can run that code during the install method. By default, any installed component will be passed a reference to the car it is installed on, when a component's install method is run. 
During this method, it's a good idea to set a reference to the car directly to **this**. In the Engine example, during the install method, the line 
    this.parent = car

ensures that the car reference being passed is stored, so code written
outside of the install method can still refer to the car this component is installed on. 
That means your install method should *always have at least one argument, and that first argument will always be the car your component is being installed on*

##Print Values
If you have properties on your component that you would like to be printed when browsing components in the simulator, place the string names of those properties in a printValues array on your component prototype (it should be named printValues). For an example, refer to the Engine prototype.initializeProps method in components.js

    this.printValues = ['hp', 'cylinders', 'torque', 'description']

The above will cause any Engine objects created to show their .hp, .cylinders, .torque and .description properties when the cursor is on that component in the simulator

##Events
If you would like to run specific functions from your component during any predefined events, there is an exisiting function inherited by CarComponent that allows you to do so. 

First, here is a list of events, and when they 'fire' during a testDrive

 onTurnOn              -Fires once when car is turned on
 onTurnOff             -Fires once when car is turned off
 onAccelerateEnter     -Fires once when acceleration starts
 onAccelerate          -Fires during acceleration
 onAccelerateLeave     -Fires once when acceleration is released
 onBrakeEnter          -Fires once when braking starts
 onBrake               -Fires during braking
 onBrakeLeave          -Fires once when brake is released
 run                   -Fires while the car is turned on
 
Using these event names, you can specify one or more functions on your component to run during one or more of these events.

This can be done during the **install** method, when a reference to the car is in context, or you can use this.parent, which will always point
to the car this component is installed on.

    Engine.prototype.install = function(car){
    this.parent = car;
    this.setGauge('rpm', 'rpm', 'rpmMax') 
    car.setEvent('onAccelerate', this.rotate.bind(this)) 
    car.setEvent('onTurnOn', ()=>{this.rpm = 400})
    car.setEvent('onTurnOff', ()=>{this.rpm = 0})
    car.setEvent('run', this.run.bind(this))  
}

In the above example, the **.setEvent** method is being called on the car argument (remember, that car is passed by the simulator for you when your install method is run. You only need to specify a name for the argument in your install code).

It is called for four different events. Two of them run a function that is defined on the Engine.prototype. Because these methods will be invoked by the Car the component is installed on, and not the component itself, when the two class methods, **rotate** and **run** are called, the **this** keyword will point to the Car, and not the Engine. To remedy this, we simply affix **.bind(this)** to the end of the two calls, which ensures the current value of 'this' will be preserved, regardless of when they are invoked. 

The other two events use arrow functions, which naturally preserve the context of **this**, so the don't need the *.bind* bit. 

