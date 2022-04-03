let aliasTitle_WindowList = Window_TitleCommand.prototype.drawAllItems;
Window_TitleCommand.prototype.drawAllItems = function () {
    this.addCommand('Car Sim', 'carsim')
    aliasTitle_WindowList.call(this)
    this.setHandler("carsim", () => { SceneManager.goto(CarSimulator) });
}

let SimSettings = {}

SimSettings.scene = function () { return SceneManager._scene }
SimSettings.page = function (pageName) {
    let page = Object.assign({}, this.getPage(pageName));
    let scn = CarSimulator.scene()
    let list = Object.keys(page)
    let length = list.length;

    if(length == 1){
        console.log('length is 1')
        page.display = page.name;
        page.command = page.name;
        page.context = page.name;
    } 
    console.log(JSON.stringify(page))
    if (page.display){
        page.display = SimSettings.getWindow(page.display, 'display')
        scn._displayWindow.setConfig(page.display)
    }

    if (page.command){
        page.command = SimSettings.getWindow(page.command, 'command')
        scn._commandWindow.setConfig(page.command)
    }

    if (page.context){
        page.context = SimSettings.getWindow(page.context, 'context')
        scn._contextWindow.setConfig(page.context)
    }

}

SimSettings.getPage = function (pageName) {
    let page = false;
    let list = this.pageSettings;
    let length = list.length;

    for (let i = 0; i < length; i++) {
        if (list[i].name == pageName) {
            return list[i]
        }
    }

    return page
}

SimSettings.pageSettings = [
    {
        name:'overview'
    },
    {
        //if only a name is provided, assume all windows have a setting by that name
        name: 'testdrive'
    },
    {
        name: 'componentList'
    },
    {
        name: 'testDriveInstructions',
        context: 'testDriveInstructions'
    }
]



SimSettings.getWindow = function (windowName, target) {
    let wind = false;
    let list = this.windowSettings;
    let length = list.length;

    for (let i = 0; i < length; i++) {
        if (list[i].name == windowName && list[i].target == target) {
            return list[i]
        }
    }

    return wind;
}

SimSettings.windowSettings = [
    {
        target: 'display',
        name: 'overview',
        procedure: 'initializeOverview'
    },
    {
        target: 'command',
        name: 'overview',
        procedure: 'initializeOverview'
    },
    {
        target: 'context',
        name: 'overview',
        procedure: 'initializeOverview'
    },
    {
        target: 'display',
        name: 'testdrive',
        procedure: 'initializeTestDrive'
    },
    {
        target: 'command',
        name: 'testdrive',
        procedure: 'initializeTestDrive'
    },
    {
        target: 'context',
        name: 'testdrive',
        procedure: 'initializeTestDrive'
    },
    {
        target: 'display',
        name: 'componentList',
        procedure: 'initializeComponentList'
    },
    {
        target: 'command',
        name: 'componentList',
        procedure: 'initializeComponentList'
    },
    {
        target: 'context',
        name: 'componentList',
        procedure: 'initializeComponentList'
    },
    {
        target: 'context', 
        name: 'testDriveInstructions',
        procedure: 'setTestDriveInstructions'
    }

]

function CarSimulator() {
    this.initialize.apply(this, arguments)
}

CarSimulator.prototype = Object.create(Scene_Base.prototype)
CarSimulator.prototype.constructor = CarSimulator;

CarSimulator.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this)
    this.initializeProps()
    this.createWindows()
}

CarSimulator.prototype.start = function(){
    Scene_Base.prototype.start.call(this)
    SimSettings.page('overview')
}

CarSimulator.prototype.initializeProps = function () {
    CarSimulator.currentCar = new Car();

}

CarSimulator.prototype.createWindows = function () {
    this._displayWindow = new SimulatorDisplayWindow()
    this.addChild(this._displayWindow)

    this._contextWindow = new SimulatorContextWindow()
    this.addChild(this._contextWindow)

    this._commandWindow = new SimulatorCommandWindow()
    this.addChild(this._commandWindow)
}

CarSimulator.scene = function () {
    return SceneManager._scene;
}

CarSimulator.currentCar = null;





function SimulatorDisplayWindow() {
    this.initialize.apply(this, arguments)
}

SimulatorDisplayWindow.prototype = Object.create(Window_Base.prototype)
SimulatorDisplayWindow.prototype.constructor = SimulatorDisplayWindow;

SimulatorDisplayWindow.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, new Rectangle(0, 0, Graphics.width * .5, Graphics.height))
    this.textLines = 0;
}

SimulatorDisplayWindow.prototype.setConfig = function(config){
    this.clean()
    this.update = ()=>{Window_Base.prototype.update.call(this)}
    
    this[config.procedure]()
}

SimulatorDisplayWindow.prototype.clean = function(){
    this.contents.clear();
    this.textLines = 0;
}

SimulatorDisplayWindow.prototype.initializeOverview = function(){
    this.printCarDetails()
    this.onSelect = ()=>{}
}

SimulatorDisplayWindow.prototype.initializeComponentList = function(){
    let scn = CarSimulator.scene();
    
    this.onSelect = ()=>{
        let list = CarComponent.componentList;
        let comp = list[scn._commandWindow._index]
        
        this.clean()
        this.addText(`${comp.type}: ${comp.name}`)
        this.addText('')
        this.drawTextEx(comp.getPrintout(), 0, this.textLines * this.lineHeight())
    }
}

SimulatorDisplayWindow.prototype.initializeTestDrive = function(){
    let car = CarSimulator.currentCar

    this.update = function(){
        Window_Base.prototype.update.call(this)
        this.clean();
        this.addText(car.getStatePrintout())
        car.checkEvents()
        this.updateGauges()
    }
    
    this.drawGauges()
}

SimulatorDisplayWindow.prototype.drawGauges = function(){
    let startY = this.y + this.padding + this.lineHeight() * 5;
    let car = CarSimulator.currentCar;
    let components = car.components;
    let gauges;

    for(let i = 0; i < components.length; i++){
        gauges = components[i].gauges;
        for(let j = 0; j < gauges.length; j++){
            this.addChild(gauges[i].container)
            gauges[i].container.position.set(this.x + this.padding, startY)+ (this.lineHeight() * i * j)
            gauges[i].text.text = components[i].gaugeProps[j]
        }
    }
}

SimulatorDisplayWindow.prototype.updateGauges = function(){
    carGauge.gauges.forEach(a => a.update())
}

SimulatorDisplayWindow.prototype.printComponentDetails = function(comp){
    let list = Object.keys(comp)
    let length = list.length;

    for(let i = 0; i < length; i++){
        this.addText(`${list[i]} : ${comp[list[i]]}`)
    }
}

SimulatorDisplayWindow.prototype.printCarDetails = function () {
    let car = CarSimulator.currentCar;

    this.addText(car.name)
    this.addText("")
    this.printAllCarComponentDetails()
}

SimulatorDisplayWindow.prototype.printAllCarComponentDetails = function () {
    let car = CarSimulator.currentCar;
    let list = car.components;

    for (let i = 0; i < list.length; i++) {
        let comp = list[i];
        let printout = `${comp.type}: ${comp.name}`
        this.addText(printout)
    }
}

SimulatorDisplayWindow.prototype.addText = function (text, x, y) {
    x = x || 0
    y = y || this.textLines++ * this.lineHeight()

    this.drawTextEx(text, x, y);
}

SimulatorDisplayWindow.prototype.onSelect = function(){

}






function SimulatorContextWindow() {
    this.initialize.apply(this, arguments)
}

SimulatorContextWindow.prototype = Object.create(Window_Base.prototype)
SimulatorContextWindow.prototype.constructor = SimulatorContextWindow;

SimulatorContextWindow.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, new Rectangle(Graphics.width * .5, Graphics.height * .5, Graphics.width * .5, Graphics.height * .5))
}

SimulatorContextWindow.prototype.setConfig = function(config){
    this.clean()
    this[config.procedure]()
}

SimulatorContextWindow.prototype.clean = function(){
    this.contents.clear()
}

SimulatorContextWindow.prototype.initializeOverview = function(){
    this.drawTextEx('Select a command\nfrom the list', 0, 0)
    this.onSelect = ()=>{}
}

SimulatorContextWindow.prototype.initializeComponentList = function(){
    this.drawText('Select a component', 0, 0)
}

SimulatorContextWindow.prototype.initializeTestDrive = function(){

}

SimulatorContextWindow.prototype.setTestDriveInstructions = function(){
    this.drawTextEx('Enter: Turn on/off\nRight: Accelerate\nLeft: Brake\nX: Return', 0, 0)
}

SimulatorContextWindow.prototype.onSelect = function(){

}



function SimulatorCommandWindow() {
    this.initialize.apply(this, arguments)
}

SimulatorCommandWindow.prototype = Object.create(Window_Command.prototype)
SimulatorCommandWindow.prototype.constructor = SimulatorCommandWindow;

SimulatorCommandWindow.prototype.initialize = function () {
    Window_Command.prototype.initialize.call(this, new Rectangle(Graphics.width * .5, 0, Graphics.width * .5, Graphics.height * .5))
}

SimulatorCommandWindow.prototype.clean = function(){
    this.clearCommandList()
    this.contents.clear()
    this.contentsBack.clear()
}

SimulatorCommandWindow.prototype.setConfig = function(config){
    this.clean()
    console.log(config)
    this[config.procedure]()
    this.drawAllItems()
    this.activate();
    this.select(0)
}


SimulatorCommandWindow.prototype.initializeOverview = function () {
    this.addCommand('Components', 'components')
    this.addCommand('Test Drive', 'testdrive')

    this.setHandler('components',()=>{SimSettings.page('componentList')})
    this.setHandler('testdrive', ()=>{SimSettings.page('testdrive')})
}

SimulatorCommandWindow.prototype.initializeComponentList = function () {
    let list = CarComponent.componentList;
    let length = list.length;

    for(let i = 0; i < length; i++){
        let car = CarSimulator.currentCar
        let name = car.hasComponent(list[i]) ? `*${list[i].name}` : list[i].name
        this.addCommand(name, 'selectcomponent')

    }

    this.setHandler('selectcomponent', this.selectComponent.bind(this))
    this.setHandler('cancel', ()=>{SimSettings.page('overview')})
}

SimulatorCommandWindow.prototype.initializeTestDrive = function(){
    this.addCommand('Controller', 'controller')

    this.setHandler('controller', this.activateController.bind(this))
}

SimulatorCommandWindow.prototype.selectComponent = function(){
    let comp = CarComponent.componentList[this._index]
    
    CarSimulator.currentCar.installComponent(comp)

    SimSettings.page('componentList')
}

SimulatorCommandWindow.prototype.activateController = function(){
    //activate InputListener
    this.update = function(){
        Window_Command.prototype.update.call(this)
        this.testDriveInputListener()
    }

    SimSettings.page('testDriveInstructions')

}

SimulatorCommandWindow.prototype.cancelController = function(){
    console.log('calling handler')
    this.update = function(){
        Window_Command.prototype.update.call(this)
    }
    SimSettings.page('testdrive')
}

SimulatorCommandWindow.prototype.testDriveInputListener = function(){
    let car = CarSimulator.currentCar


    if(Input.isTriggered('ok')){
        car.state.isTurnedOn = !car.state.isTurnedOn
    }

    if(Input.isPressed('right') && car.state.isTurnedOn){
        car.state.isAccelerating = true;
    } else {
        car.state.isAccelerating = false;
    }

    if(Input.isPressed('left') && car.state.isTurnedOn){
        car.state.isBraking = true;
    } else {
        car.state.isBraking = false;
    }

    if(Input.isTriggered('cancel')){
        this.cancelController()
    }
    
}

SimulatorCommandWindow.prototype.select = function(index){
    let scn = CarSimulator.scene();

    Window_Command.prototype.select.call(this, index)
    if(scn.__proto__.constructor.name != 'CarSimulator')
        return
    scn._displayWindow.onSelect()
    scn._contextWindow.onSelect()
}



function Car() {
    Car.carList.push(this)
    this.initializeProps()
    this.initializeSharedProps()
}

Car.modelCount = 1;
Car.carList = [];

Car.prototype.initializeProps = function () {
    this.name = `Model #${Car.modelCount}`
    this.id = (Car.modelCount++).padZero(4)
    this.components = []
    this.sharedProps = {
        fuelEfficiencyModifier: 1,
        speed: 0
    }
    this.events = {
        onAccelerateEnter: [],
        onAccelerate: [],
        onAccelerateLeave: [],
        onBrakeEnter: [],
        onBrake: [],
        onBrakeLeave: [],
        onDriveEnter: [],
        onDrive: [],
        onDriveLeave: [],
        onTurnOn: [],
        onTurnOff: [],
        run: []
    }
    this.previousState = {};
    this.state = {
        isTurnedOn: false,
        isDriving: false,
        isAccelerating: false,
        isBraking: false
    }
}

Car.prototype.checkEvents = function(){
    this.acceleratorEvents()
    this.driveEvents()
    this.brakeEvents()
    this.onOffEvents()
    if(this.state.isTurnedOn)
        this.runEvents(this.events.run)
    this.previousState = Object.assign({}, this.state)
}

Car.prototype.runEvents = function(events){
    events.forEach(a => a())
}

Car.prototype.acceleratorEvents = function(){
    let state = this.state;
    let previous = this.previousState;

    if(state.isAccelerating){
        this.runEvents(this.events.onAccelerate)
        if(!previous.isAccelerating)
            this.runEvents(this.events.onAccelerateEnter)
    } else if(previous.isAccelerating){
            this.runEvents(this.events.onAccelerateLeave)
    }

    
}

Car.prototype.driveEvents = function(){
    let state = this.state;
    let previous = this.previousState;

    
    if(state.isDriving){
        this.runEvents(this.events.onDrive)
        if(!previous.isDriving)
            this.runEvents(this.events.onDriveEnter)
    } else if(previous.isDriving){
            this.runEvents(this.events.onDriveLeave)
    }

    
}

Car.prototype.brakeEvents = function(){
    let state = this.state;
    let previous = this.previousState;

    if(state.isBraking){
        this.runEvents(this.events.onBrake)
        if(!previous.isBraking)
            this.runEvents(this.events.onBrakeEnter)
    } else if(previous.isBraking){
            this.runEvents(this.events.onBrakeLeave)
    }

    
}

Car.prototype.onOffEvents = function(){
    let state = this.state;
    let previous = this.previousState;

    if(state.isTurnedOn && !previous.isTurnedOn)
        this.runEvents(this.events.onTurnOn)
    else if(!state.isTurnedOn && previous.isTurnedOn)
        this.runEvents(this.events.onTurnOff)
}

Car.prototype.getStatePrintout = function(){
    let str = ""
    let list = Object.keys(this.state)
    let length = list.length;

    for(let i = 0; i < length; i++){
        str += list[i] + ': ' + this.state[list[i]] + (i == length - 1 ? "" : "\n")
    }
    
    return str;
}

Car.prototype.initializeSharedProps = function () {
    this.fuelEfficiencyModifier = 0;
}

Car.prototype.setEvent = function (eventName, cb) {
    this.events[eventName].push(cb)
}

Car.prototype.installComponent = function (component) {
    this.validateInstallComponent(component)
    component.install(this)
}

Car.prototype.validateInstallComponent = function (component) {
    let list = this.components;
    let length = list.length;

    for(let i = 0; i < length; i++){
        if (list[i].type === component.type) {
            list[i] = component
            return
        }
    }

    this.components.push(component)
}

Car.prototype.hasComponent = function(component){
    let list = this.components;
    let length = list.length;
    
    for(let i = 0; i < length; i++){
        if (list[i].type === component.type && list[i].name === component.name) {
            console.log('current car has this component')
            return true
        }
    }
    

    return false
}

Car.prototype.updateEvents = function () {
    this.checkAcceleratorEvents()
    this.checkDriveEvents()
}

Car.prototype.ignition = function (start) {
    this.isTurnedOn = start || false
    if (start) {
        this.events.onTurnOn.forEach(a => a())
    } else {
        this.events.onTurnOff.forEach(a => a())
    }
}


function CarComponent(type, name) {
    this.initialize.apply(this, arguments)
}

CarComponent.prototype.initialize = function(type, name){
    this.type = type;
    this.name = name;
    this.gauges = [];
    this.gaugeProps = [];
    this.printValues = [];
    this.testValues = [];

    CarComponent.componentList.push(this)
}

CarComponent.prototype.install = function (car) {
    try {
        throw new Error('NO INSTALL METHOD PROVIDED FOR THIS COMPONENT')
    }
    catch (e) {
        console.log(e)
    }
}

CarComponent.prototype.setGauge = function (propName, propCurrent, propMax) {
    this.gaugeProps.push(propName)
    this.gauges.push(new carGauge(this, propCurrent, propMax))
}

CarComponent.prototype.setPrintValue = function(value){
    if(this.printValues.indexOf(value) == -1){
        this.printValues.push(value)
    }
}

CarComponent.prototype.getPrintout = function(){
    let list = Object.values(this.printValues)
    let length = list.length;
    let str = "";

    for(let i = 0; i < length; i++){
        str += list[i] + ' : ' + this[list[i]] + '\n';
    }

    return str
}

CarComponent.componentList = []


function carGauge(obj, cur, max){
    this.obj = obj;
    this.cur = cur;
    this.max = max;
    this.setupGraphics();
    carGauge.gauges.push(this)
}

carGauge.gauges = [];

carGauge.destroyGauges = function(){
    let list = carGauge.gauges;
    let length = list.length;
    let scn = CarSimulator.scene;

    for(let i = 0; i < length; i++){
        scn.removeChild(list[i].container)
        list[i].container.destroy(true)
        list[i].container = undefined
    }

    carGauge.gauges = [];
}

carGauge.prototype.setupGraphics = function(){
    let max = this.obj[this.max]
    let cur = this.obj[this.cur]

    this.container = new PIXI.Container;
    this.back = new PIXI.Graphics;
    this.back.lineStyle(2, 0x000000, 1)
    this.back.beginFill(0x333333, 1)
    this.back.drawRect(0, 0, Graphics.width * .1, Graphics.height * .05)

    this.front = new PIXI.Graphics;
    this.front.beginFill(0xFFFFFF, 1)
    this.front.drawRect(0, 0, (Graphics.width * .1)  * (cur/max), Graphics.height * .05)

    this.text = new PIXI.Text;
    this.text.style.fill = 'white'
    this.container.addChild(this.back, this.front, this.text)
    this.text.x = this.back.width + Graphics.width * .02
}

carGauge.prototype.update = function(){
    let max = this.obj[this.max]
    let cur = this.obj[this.cur]

    this.container.children[1].geometry.clear()
    this.front.drawRect(0, 0, (Graphics.width * .1)  * (cur/max), Graphics.height * .05)
    
}

