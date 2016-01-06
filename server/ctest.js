"use strict";

casper.on("remote.message", function(msg) {
    this.echo("Console: " + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("page Error: " + msg);
});

casper.on("resource.error", function(msg, trace) {
    this.echo("Res.Error: " + msg);
});

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

function sendEvent(event, elem) {
    casper.page.sendEvent(event, elem.cx, elem.cy);
}

function sendKey(key){
    var sendEv = casper.page.sendEvent;
    sendEv('keydown', key);
    sendEv('keyup', key);
}

function sendFocus(elem) {
    casper.page.evaluate(function(id) {
       var theElement = document.getElementById(id);
       theElement.focus(); 
    }, elem);
}

function sendText(text) {
    casper.page.sendEvent('keypress', text);
}

var keys = null;
var testUrl = 'http://localhost:43091/demo';


casper.test.begin("Test checkbox", function(test) {
    casper.start(testUrl, function() {
        var boolName = 'bool1';
        function testKey(key, expected, description){
            sendKey(key);
            var bool1 = getInfo(boolName);
            test.assertEquals(bool1.value, expected, description );
        }
        keys = casper.page.event.key;
        test.assertTitle('tedede demo', 'titulo correcto');
        test.assertExists('#bool1', 'tengo bool1');
        var bool1 = getInfo(boolName);
        test.assertEquals(bool1.value , false, "default value is false");
        sendEvent('click', bool1);
        bool1 = getInfo(boolName);
        test.assertEquals(bool1.value , true, "one click sets it to true");
        
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
        keys = casper.page.event.key;
        test.assertExists('#text1', 'tengo text1');
        var textN = 'text1';
        var text1 = getInfo(textN);
        test.assertEquals(text1.isActive,false);
        test.assert(! text1.value, "default value to null");
        sendFocus(textN);
        text1 = getInfo(textN);
        test.assertEquals(text1.isActive,true, "should be active if it has focus");
        sendText('ab');
        text1 = getInfo(textN);
        test.assertEquals(text1.value,'ab', 'should set text');
        sendKey(keys.Backspace);
        sendKey(keys.Backspace);
        text1 = getInfo(textN);
        test.assert(! text1.value, 'double backspace should set to null');
        sendKey(keys.Space);
        text1 = getInfo(textN);
        test.assertEquals(text1.value,'', 'space should set to emtpy string');
        sendKey(keys.Left);
        text1 = getInfo(textN);
        test.assertEquals(text1.value,'', 'left should not alter the value');
        sendKey(keys.A);
        text1 = getInfo(textN);
        test.assertEquals(text1.value,'A', 'should set to "A"');
        sendKey(keys.Left);
        text1 = getInfo(textN);
        test.assertEquals(text1.value,'A', 'left should not alter the value (2)');
        sendKey(keys.B);
        text1 = getInfo(textN);
        test.assertEquals(text1.value,'BA', 'should set to "BA"');
        sendKey(keys.Delete);
        text1 = getInfo(textN);
        test.assert(text1.value=='B', 'delete should erase one character');
        sendKey(keys.Backspace);
        text1 = getInfo(textN);
        test.assert(! text1.value, 'backspace should set to null');
    }).run(function() {
        test.done();
    });    
});

