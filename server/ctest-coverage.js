"use strict";

var keys = null;
var baseUrl = 'http://localhost:43091';
var testUrl = baseUrl + '/demo';
var coverageUrl = baseUrl + '/coverage';
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
        
        var sentCover = this.evaluate(function(wsurl) {
            try {
                var data = __utils__.sendAJAX(wsurl, 'POST', JSON.stringify(window.__coverage__), false);
                console.log("data",  data)
                return JSON.parse(data);
            } catch (e) {
                console.log("sentCover error", e)
            }
        }, {wsurl: coverageUrl+'/tedede'});
        console.log("sent coverage", sentCover)
    }).run(function() {
        test.done();
    });    
});

casper.test.begin("Test coverage", function suite(test) {
    casper.start(testUrl, function() {
        test.assertTitle('tedede demo', 'titulo correcto');
        var posted = this.evaluate(function(wsurl) {
            try {
                return JSON.parse(__utils__.sendAJAX(wsurl, 'GET', null, false)).name;
            } catch (e) {
                console.log("posted error", e)
            }
        }, {wsurl: coverageUrl});
        console.log("coverage requested", posted)
        test.assertTrue(true);
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