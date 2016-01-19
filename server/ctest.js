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

function sendFocus(elem) {
    casper.page.evaluate(function(id) {
       var theElement = document.getElementById(id);
       theElement.focus(); 
    }, elem);
}

function testSendKeyAndCompare(test, elementId, key, expected, description){
    sendKey(key);
    var info = getInfo(elementId);
    test.assertEquals(info.value, expected, description );
};


function testSendClickAndCompare(test, elementId, expected, description){
    var info = getInfo(elementId);
    casper.page.sendEvent('click', info.cx, info.cy);
    info = getInfo(elementId);
    //casper.echo("exp:"+expected+" real:"+info.value)
    test.assertEquals(info.value, expected, description);
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
        testKey(keys.Space, false, "space sets to false (2)");
        testKey(keys.Backspace, null, "backspace sets null");
        testKey(keys.Space, false, "space sets to false (3)");
        testKey(keys.Minus, null, "minus sets null");
        testKey(keys.Space, false, "space sets to false (4)");
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
        test.assertExists('#txtEmiter', 'tengo emmiter');
        casper.page.evaluate(function() {
            window.myUpdateEventResult='.';
            window.mySourceElement = null;
            txtEmiter.addEventListener("update", function updateEvent(e){
                window.myUpdateEventResult+='ok';
                window.mySourceElement = e.target;
            }, false);
        });
        var testKey = testSendKeyAndCompare.bind(null, test, elementId);
        testKey(keys.A, 'A');
        testKey(keys.Tab, 'A'); // esto debe disparar el evento
        var myUpdateEventResult=casper.page.evaluate(function() {
            return window.myUpdateEventResult;
        });
        var mySourceElement=casper.page.evaluate(function() {
            return window.mySourceElement;
        });
        var txtEmiter = casper.page.evaluate(function(id) {
            return document.getElementById(id);
        }, elementId);
        test.assertEquals(myUpdateEventResult,'.ok');
        test.assertEquals(mySourceElement, txtEmiter);
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
        testClick(true, "click should change value and fire update");
        
        var myCounter=casper.page.evaluate(function() {
            return window.myCounter;
        });
        var mySourceElement=casper.page.evaluate(function() {
            return window.mySourceElement;
        });
        var bool1 = casper.page.evaluate(function(id) {
            return document.getElementById(id);
        }, elementId);
        
        test.assertEquals(myCounter, 1);
        test.assertEquals(mySourceElement, bool1);
        
        
        testClick(false, "another click should change value and fire update");
        
        var myCounter=casper.page.evaluate(function() {
            return window.myCounter;
        });
        var mySourceElement=casper.page.evaluate(function() {
            return window.mySourceElement;
        });
        var bool1 = casper.page.evaluate(function(id) {
            return document.getElementById(id);
        }, elementId);
        
        test.assertEquals(myCounter, 2);
        test.assertEquals(mySourceElement, bool1);
        
    }).run(function() {
        this.test.done();
    });    
});


casper.test.begin("Test bool with options", function(test) {
    casper.start(testUrl, function() {
        test.assertExists('#bool2', 'tengo bool2');
       
        var elementId =  'bool2';
        
        var testKey = testSendKeyAndCompare.bind(null, test, elementId);
        var bool2 = getInfo(elementId);
        this.echo(bool2.value);
/*
        
        test.assertEquals(bool2.value, null, "default value to null");

        var labelTrue = getInfo('label-bool2-true');
        casper.page.sendEvent('click', labelTrue.cx, labelTrue.cy);
        bool2 = getInfo(elementId);
        test.assertEquals(bool2.value,true);

        var labelFalse=getInfo('bool2-false');
        casper.page.sendEvent('click', labelFalse.cx,labelFalse.cy);
        var bool2=getInfo(elementId);
        test.assertEquals(bool2.value,false);
        
        //este test da como resultado 'element not adapted'
        var radioButton=getInfo('bool2-true');
        casper.page.sendEvent('click',radioButton.cx, radioButton.cy);
       // console.log("############   radioButton", radioButton.value);
        var bool2=getInfo(elementId);
        test.assertEquals(bool2.value,true);
*/ 
    }).run(function() {
        test.done();
    });    
});

// checkeo de tests funcionará al actualizar CasperJS!
casper.test.begin("Finish", function(test) {
    casper.start(testUrl, function() {
        this.echo("# errores: "+numErrors)
    }).run(function() {
        this.test.done(numErrors === 0);
    });    
});