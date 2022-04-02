let aliasTitle_WindowList = Window_TitleCommand.prototype.drawAllItems;
Window_TitleCommand.prototype.drawAllItems = function(){
    this.addCommand('Car Sim', 'carsim')
    aliasTitle_WindowList.call(this)
    this.setHandler("carsim", ()=>{SceneManager.goto(CarSimulator)});
}


function CarSimulator(){
    this.initialize.apply(this, arguments)
}

CarSimulator.prototype = Object.create(Scene_Base.prototype)
CarSimulator.prototype.constructor = CarSimulator;

CarSimulator.prototype.initialize = function(){
    Scene_Base.prototype.initialize.call(this)
    this.initializeProps()
    this.createWindows()
    this._mainWindow.printCarDetails()
}

CarSimulator.prototype.initializeProps = function(){
    CarSimulator.currentCar = new Car();

    new CarComponent('Engine', 'V8 Daddy Stroke 5.3');
}

CarSimulator.prototype.createWindows = function(){
    this._mainWindow = new SimulatorWindow()
    this.addChild(this._mainWindow)

    this._helpWindow = new SimulatorHelpWindow()
    this.addChild(this._helpWindow)

    this._commandWindow = new SimulatorMainCommandWindow()
    this.addChild(this._commandWindow)
}

CarSimulator.scene = function(){
    return SceneManager._scene;
}

CarSimulator.currentCar = null;




function SimulatorWindow(){
    this.initialize.apply(this, arguments)
}

SimulatorWindow.prototype = Object.create(Window_Base.prototype)
SimulatorWindow.prototype.constructor = SimulatorWindow;

SimulatorWindow.prototype.initialize = function(){
    Window_Base.prototype.initialize.call(this, new Rectangle(0, 0, Graphics.width * .5, Graphics.height))
    this.textLines = 0;
}

SimulatorWindow.prototype.printCarDetails = function(){
    let car = CarSimulator.currentCar;

    this.addText(car.name)
    this.addText("")
    this.printComponentDetails()
}

SimulatorWindow.prototype.printComponentDetails = function(){
    let car = CarSimulator.currentCar;
    let list = car.components;

    for(let i = 0; i < list.length; i++){
        let comp = list[i];
        let printout = `${comp.type}: ${comp.name}`
        this.addText(printout)
    }
}

SimulatorWindow.prototype.addText = function(text, x, y){
    x = x || 0
    y = y || this.textLines++ * this.lineHeight()

    this.drawText(text, x, y);
}




function SimulatorHelpWindow(){
    this.initialize.apply(this, arguments)
}

SimulatorHelpWindow.prototype = Object.create(Window_Base.prototype)
SimulatorHelpWindow.prototype.constructor = SimulatorHelpWindow;

SimulatorHelpWindow.prototype.initialize = function(){
    Window_Base.prototype.initialize.call(this, new Rectangle(Graphics.width * .5, Graphics.height * .5, Graphics.width * .5, Graphics.height * .5))
}


function SimulatorMainCommandWindow(){
    this.initialize.apply(this, arguments)
}

SimulatorMainCommandWindow.prototype = Object.create(Window_Command.prototype)
SimulatorMainCommandWindow.prototype.constructor = SimulatorMainCommandWindow;

SimulatorMainCommandWindow.prototype.initialize = function(){
    Window_Command.prototype.initialize.call(this, new Rectangle(Graphics.width * .5, 0, Graphics.width * .5, Graphics.height * .5))    
}

SimulatorMainCommandWindow.prototype.makeCommandList = function(){
    this.addCommand('Components', 'components')
    this.setHandler('components', this.createComponentCommandWindow.bind(this))
    console.log('calling mak')
}

SimulatorMainCommandWindow.prototype.createComponentCommandWindow = function(){
    console.log('calling create component command window')
}




function Car(){
    Car.carList.push(this)
    this.initializeProps()
    this.initializeSharedProps()
}

Car.modelCount = 1;
Car.carList = [];

Car.prototype.initializeProps = function(){
    this.name = `Model #${Car.modelCount}`
    this.id = (Car.modelCount++).padZero(4)
    this.components = []
    this.events = {
        onAccelerateEnter:[],
        onAccelerate:[],
        onAccelerateLeave:[],
        onDriveEnter:[],
        onDrive:[],
        onDriveLeave:[],
        onTurnOn:[],
        onTurnOff:[]
    }
    this.state = {
        isTurnedOn:false,
        isDriving:false,
        isAccelerating:false,
        isBraking:false
    }
}

Car.prototype.initializeSharedProps = function(){
    this.fuelEfficiencyModifier = 0;
}



Car.prototype.installComponent = function(component){
    this.validateInstallComponent(component)
    component.install()
}

Car.prototype.validateInstallComponent = function(component){
    let list = this.components;

    list.forEach(a => {
        if(a.type === component.type){
            a = component
            return
        }
    })

    this.components.push(component)
}



function CarComponent(type, name){
    this.type = type;
    this.name = name;
}

CarComponent.prototype.install = function(){
    try{
        throw new Error('NO INSTALL METHOD PROVIDED FOR THIS COMPONENT')
    }
    catch(e){
        console.log(e)
    }
}

CarComponent.componentList = []

CarComponent.create = function(type, name){
    this.componentList.push(new CarComponent(type, name))
}

