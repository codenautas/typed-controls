"use strict";

console.log('starting phantom');

var expect = require('expect.js');

var page = require('webpage').create();
var system = require('system');

console.log('The default user agent is ');
console.log(page.settings.userAgent);
page.settings.userAgent = page.settings.userAgent.replace(new RegExp("PhantomJS/.* Safari/[0-9.]*"),'Safari 5.1.7');
console.log('using new user agent (Safari not Phantom)');
console.log(page.settings.userAgent);

var pageName = 'http://localhost:43091/demo';

function getInfo(id){
    return JSON.parse(page.evaluate(function(id){
        var theElement = document.getElementById(id);
        var rect = theElement.getBoundingClientRect();
        return JSON.stringify({
            value: 'getTypedValue' in theElement?theElement.getTypedValue():'not adapted',
            cx: Math.floor((rect.left+rect.right)/2),
            cy: Math.floor((rect.top+rect.bottom)/2),
            isActive: document.activeElement === theElement
        });
    }, id));
}

page.open(pageName, function(status, moreInfo) {
    if(status !== 'success') {
        console.log('Unable to access page', pageName, status, moreInfo);
        phantom.exit();
    }else{
        runTests(page);
    }
});


page.onConsoleMessage = function(msg) {
    console.log('#',msg);
}

function runTests(page){
    function sendKey(key){
        page.sendEvent('keydown', key);
        page.sendEvent('keyup', key);
    }
    function testCheckbox(){
        var bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(false);
        page.sendEvent('click', bool1.cx, bool1.cy);
        console.log('click', bool1.cx, bool1.cy);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(true);
        sendKey(page.event.key.Space);
        // page.sendEvent('keypress', page.event.key.Space);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(false);
        sendKey(page.event.key.Delete);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(null);
        sendKey(page.event.key.Space);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(false);
        sendKey(page.event.key.Space);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(true);
        sendKey(page.event.key.Backspace);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(null);
        sendKey(page.event.key.Space);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(false);
        sendKey(page.event.key.Minus);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(null);
        sendKey(page.event.key.Space);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(false);
        sendKey(page.event.key.Period);
        bool1 = getInfo('bool1'); 
        expect(bool1.value).to.be(null);
    }
    function testText(){
        var text1 = getInfo('text1'); 
        expect(text1.value).to.be(null);
        page.evaluate(function(id){
            var theElement = document.getElementById(id);
            theElement.focus();
        }, 'text1')
        text1 = getInfo('text1'); 
        expect(text1.isActive).to.be(true);
        page.sendEvent('keypress', 'ab');
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('ab');
        sendKey(page.event.key.Backspace);
        sendKey(page.event.key.Backspace);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be(null);
        sendKey(page.event.key.Space);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('');
        sendKey(page.event.key.Left);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('');
        sendKey(page.event.key.A);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('A');
        sendKey(page.event.key.Left);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('A');
        sendKey(page.event.key.B);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('BA');
        sendKey(page.event.key.Delete);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be('B');
        sendKey(page.event.key.Backspace);
        text1 = getInfo('text1'); 
        expect(text1.value).to.be(null);
    }
    try{
        testCheckbox();
        testText();
        page.render('server/local-capture.png', {format: 'png', quality: '100'});
    }catch(err){
        console.log('ERROR. TESTING');
        console.log(err.stack);
    }
    if(!(system.args.indexOf('--hold')>0)){
        phantom.exit();
    }
}