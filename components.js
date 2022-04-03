function Engine(){
    this.initialize.apply(this, arguments)
}

Engine.prototype = Object.create(CarComponent.prototype)

Engine.prototype.initialize = function(name, cylinders, torque){
    CarComponent.prototype.initialize.call(this, 'Engine', name)

    this.cylinders = cylinders;
    this.torque = torque

    this.initializeProps()
}

Engine.prototype.initializeProps = function(){
    this.rpm = 0;
    this.rpmMax = 8000
    this.hp = (this.torque * this.rpmMax) / 5252
    this.hp -= 60;
    this.hp = Math.floor(this.hp)
    this.description = `A basic engine, 
for a basic bitch.`
    
    this.printValues = ['hp', 'cylinders', 'torque', 'description']
}

Engine.prototype.rotate = function(){

    if(this.rpm + (this.rpm * (this.hp * .0005)) <= this.rpmMax){
       this.rpm += 1 + (this.rpm * (this.hp * .0005))
    }
}

Engine.prototype.run = function(){
    if(!this.parent.state.isAccelerating)
    this.rpm = Math.max(400, this.rpm - 50)
}

Engine.prototype.install = function(car){
    this.parent = car;
    this.setGauge('rpm', 'rpm', 'rpmMax') 
    car.setEvent('onAccelerate', this.rotate.bind(this)) 
    car.setEvent('onTurnOn', ()=>{this.rpm = 400})
    car.setEvent('onTurnOff', ()=>{this.rpm = 0})
    car.setEvent('run', this.run.bind(this))  
}


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
















//Instantiate your Components Below
new Engine('Basic Bitch V1', 4, 120, 100)