"use strict";

var keys = null;
var testUrl = 'http://localhost:43091/demo';
var numErrors = 0;

function getInfo(elemId) {
    return JSON.parse(casper.page.evaluate(function(id) {
        var theElement = document.getElementById(id);
        var rect = theElement.getBoundingClientRect();
        return JSON.stringify({
            value: 'getTypedValue' in theElement?theElement.getTypedValue():'not adapted',
            cx: Math.floor((rect.left+rect.right)/2),
            cy: Math.floor((rect.top+rect.bottom)/2),
            isActive: document.activeElement === theElement
        })
    }, elemId));
}

function sendKey(keysOrKey){
    if(typeof keysOrKey === "string"){
        casper.page.sendEvent('keypress', keysOrKey);
    }else{
        var sendEvent = casper.page.sendEvent;
        sendEvent('keydown', keysOrKey);
        sendEvent('keyup', keysOrKey);
    }
}

function sendEv(eventName, elem) {
    casper.page.evaluate(function(ev, id) {
       var theElement = document.getElementById(id);
       theElement[ev]();
    }, eventName, elem);
}

function sendFocus(elem) { sendEv('focus', elem); }
function sendClick(elem) { sendEv('click', elem); }

function testSendKeyAndCompare(test, elementId, key, expected, description){
    sendKey(key);
    var info = getInfo(elementId);
    test.assertEquals(info.value, expected, description );
};

function testSendClickAndCompare(test, elementId, expected, description){
    sendClick(elementId);
    var info = getInfo(elementId);
    test.assertEquals(info.value, expected, description);
};

function testSendClickToGroupAndCompare(test, groupId, elementId, expected, description){
    sendClick(elementId);
    var info = getInfo(groupId);
    test.assertEquals(info.value, expected, description);
};

function testCompareUpdatedVar(test, winVar, expectedVar, description){
    var myVar=casper.page.evaluate(function(wVar) {
        return window[wVar];
    }, winVar);
    test.assertEquals(myVar, expectedVar, description);
};

function testCompareSender(test, sourceId, expectedSource, description){
    var mySourceElement_equals_mySourceId=casper.page.evaluate(function(wVar, id) {
        return window[wVar] === document.getElementById(id);
    }, sourceId, expectedSource);
    test.assertEquals(mySourceElement_equals_mySourceId, true , description);
};

casper.test.on("fail", function () {
    ++numErrors;
});

// hooks para errores
casper.on("remote.message", function(msg) {
    this.echo("Console: " + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("page Error: " + msg);
    for(var t in trace) {
        var tra = trace[t];
        this.echo("  ["+tra.file+":"+tra.line+"] "+tra.function)
    }
});

casper.on("resource.error", function(msg, trace) {
    this.echo("Res.Error: " + msg);
});


// Una sola vez
casper.test.begin('Setup', function(test) {
    casper.start(testUrl, function() {
        keys = casper.page.event.key;
        test.done();
    }).run(function() {
        test.done();
    });
});

// Inicio de los tests
casper.test.begin("Test checkbox", function suite(test) {
    casper.start(testUrl, function() {
        var elementId =  'bool1';
        test.assertTitle('tedede demo', 'titulo correcto');
        test.assertExists('#bool1', 'tengo bool1');
        var bool1 = getInfo(elementId);
        test.assertEquals(bool1.value, false, "default value is false");

        var testClick = testSendClickAndCompare.bind(null, test, elementId);
        testClick(true, "one click sets it to true");
        testClick(false, "one click sets it to false");
        testClick(true, "one click sets it back to true");
        
        var testKey = testSendKeyAndCompare.bind(null, test, elementId);
        testKey(keys.Space, false, "space sets to false");
        testKey(keys.Delete, null, "delete sets null");
        var postNull = true;
        testKey(keys.Space, postNull, "space sets to post null (2)");
        testKey(keys.Backspace, null, "backspace sets null");
        testKey(keys.Space, postNull, "space sets to post null (3)");
        testKey(keys.Minus, null, "minus sets null");
        testKey(keys.Space, postNull, "space sets to post null (4)");
        testKey(keys.Space, !postNull, "space sets to not post null (4)");
        testKey(keys.Period, null, "period sets null");
    }).run(function() {
        test.done();
    });    
});

casper.test.begin("Test Text", function(test) {
    casper.start(testUrl, function() {
        test.assertExists('#text1', 'tengo text1');
        var elementId =  'text1';
        var text1 = getInfo(elementId);
        var testKey = testSendKeyAndCompare.bind(null, test, elementId);
        test.assertEquals(text1.isActive,false);
        test.assert(! text1.value, "default value to null");
        sendFocus(elementId);
        text1 = getInfo(elementId);
        test.assertEquals(text1.isActive,true, "should be active if it has focus");
        testKey('ab', 'ab', 'should set text');
        testKey(keys.Backspace, 'a' ,'should erase the last key');
        testKey(keys.Backspace, null ,'because the control has two chars the double backspace should set to null');
        testKey(keys.Space, '', 'space in a null input should set to emtpy string');
        testKey(keys.Left, '', 'left should not alter the value');
        testKey(keys.A, 'A', 'should set to "A"');
        testKey(keys.Left,'A', 'left should not alter the value (2)');
        testKey(keys.B,'BA', 'should set to "BA"');
        testKey(keys.Delete, 'B', 'delete should erase one character');
        testKey(keys.Backspace, null, 'backspace should set to null');
        testKey(keys.Space, '', 'space in a null input should set to emtpy string (2)');
    }).run(function() {
        test.done();
    });    
});


casper.test.begin("Test text with custom event", function(test) {
    casper.start(testUrl, function() {
        var elementId='txtEmiter';
        sendFocus(elementId);
        test.assertExists('#txtEmiter', 'tengo emiter');
        casper.page.evaluate(function() {
            window.myUpdateEventResult='.';
            window.mySourceElement = null;
            txtEmiter.addEventListener("update", function updateEvent(e){
                window.myUpdateEventResult+='ok';
                window.mySourceElement = e.target;
            }, false);
        });
        var testKey = testSendKeyAndCompare.bind(null, test, elementId);
        testKey(keys.A, 'A', 'value should be set to "A"');
        testKey(keys.Tab, 'A', 'value should not change but fire the update event'); // esto debe disparar el evento
        var myUpdateEventResult=casper.page.evaluate(function() {
            return window.myUpdateEventResult;
        });
        var mySourceElement_IsEqualTo_txtEmiter=casper.page.evaluate(function(id) {
            return window.mySourceElement === document.getElementById(id);
        }, elementId);
        test.assertEquals(myUpdateEventResult,'.ok', 'result should be updated');
        test.assertEquals(mySourceElement_IsEqualTo_txtEmiter, true, 'update sender should be "'+elementId+'"');
    }).run(function() {
        this.test.done();
    });    
});

casper.test.begin("Test checkbox with custom event", function(test) {
    casper.start(testUrl, function() {
        var elementId =  'bool1';
        test.assertExists('#'+elementId, 'tengo bool1');
        sendFocus(elementId);
        
        casper.page.evaluate(function() {
            window.myCounter=0;
            window.mySourceElement = null;
            bool1.addEventListener("update", function updateEvent(e){
                ++window.myCounter;
                window.mySourceElement = e.target;
            }, false);
        });
        
        var testClick = testSendClickAndCompare.bind(null, test, elementId);
        var compareSender = testCompareSender.bind(null, test, 'mySourceElement');
        var compareVar = testCompareUpdatedVar.bind(null, test, 'myCounter');
        
        testClick(true, "click should change value to TRUE and fire update");
        compareVar(1, 'should set to 1');
        
        testClick(false, "another click should change value to FALSE and fire update");
        compareVar(2, 'should set to 2');
        
        testClick(true, "another click should change value BACK TO TRUE and fire update");
        compareVar(3, 'should set to 3');
        
        compareSender(elementId, "sender should be '"+elementId+"'");
        
        var testKey = testSendKeyAndCompare.bind(null, test, elementId);        
        testKey(keys.Space, false, 'SPACE should change value to FALSE and fire update');
        compareVar(4, 'should set to 4');
        
        testKey(keys.Space, true, 'SPACE should change value BACK to TRUE and fire update');
        compareVar(5, 'should set to 5');
        
        testKey(keys.Space, false, 'SPACE should change value BACK to FALSE and fire update');
        compareVar(6, 'should set to 6');
        
        // compareSender(elementId, "sender should be '"+elementId+"'");
        
    }).run(function() {
        this.test.done();
    });    
});

casper.test.begin("Test bool with options", function(test) {
    casper.start(testUrl, function() {
        var boolG =  'bool2';
        var boolT = 'bool2-true';
        var boolF = 'bool2-false';
        test.assertExists('#'+boolG, 'tengo bool2');
        test.assertExists('#'+boolT, 'tengo bool2-true');
        test.assertExists('#'+boolF, 'tengo bool2-false');
        var clickTrue = testSendClickToGroupAndCompare.bind(null, test, boolG, boolT);
        var clickFalse = testSendClickToGroupAndCompare.bind(null, test, boolG, boolF);
        
        clickTrue(true, 'click on true sets to true');
        clickFalse(false, 'click on FALSE sets to FALSE');
        clickFalse(false, 'click on FALSE mantains FALSE');
        clickTrue(true, 'click on true sets to true');
        
    }).run(function() {
        test.done();
    });    
});

casper.test.begin("Test options", function(test) {
    casper.start(testUrl, function() {
        casper.page.evaluate(function() {
            //console.log("Tedede", JSON.stringify(Tedede))
            //console.log("ABP", JSON.stringify(AjaxBestPromise))
            var opts=[
                {option:"a", label:"Total"},
                {option:"b", label:"Parcial"},
                {option:"c", label:"No cumplió (aclarar en observaciones)"},
                {option:9  , label:"No aplica"}
            ];
            var elementoOpciones = Tedede.optionsCtrl({typeName:'enum', options:opts}).create();
            elementoOpciones.id='the-opt-ctrl';
            document.body.appendChild(elementoOpciones);
            Tedede.adaptElement(elementoOpciones,{typeName:"enum", options:opts});
            window.myRegisterEvents='';
            window.mySourceElement = null;
            bool1.addEventListener("update", function updateEvent(e){
                ++window.myCounter;
                window.mySourceElement = e.target;
            }, false);
        });
        testSendClickToGroupAndCompare(test, 'the-opt-ctrl', 'the-opt-ctrl-a', 'a', 'si toco a es a');
        testSendClickToGroupAndCompare(test, 'the-opt-ctrl', 'the-opt-ctrl-b', 'b', 'si toco b es b');
    }).run(function() {
        test.done();
    });    
});

/*
casper.test.begin("Test bool with options with custom event", function(test) {
    casper.start(testUrl, function() {
        var boolG =  'bool2';
        var boolT = 'bool2-true';
        var boolF = 'bool2-false';
        
        casper.page.evaluate(function() {
            window.myCounter=10;
            window.mySourceElement = null;
            bool1.addEventListener("update", function updateEvent(e){
                window.myCounter += 7;
                window.mySourceElement = e.target;
            }, false);
        });
        
        sendFocus(boolG);
        
        // var testKey = testSendKeyAndCompare.bind(null, test, boolG);
        // var compareSender = testCompareSender.bind(null, test, 'mySourceElement');
        // var compareVar = testCompareUpdatedVar.bind(null, test, 'myCounter');
        
        // testKey(keys.Tab, null, 'Should trigger update event');
        // compareVar(17, 'should set to 17');
        // compareSender(boolG, "sender should be '"+boolG+"'");        
        
    }).run(function() {
        this.test.done();
    });    
});
*/

// checkeo de tests funcionará al actualizar CasperJS!
casper.test.begin("Finish", function(test) {
    casper.start(testUrl, function() {
        this.echo("# errores: "+numErrors)
    }).run(function() {
        this.test.done(numErrors === 0);
    });    
});