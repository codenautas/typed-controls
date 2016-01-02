console.log('starting phantom');

var expect = require('expect.js');

var page = require('webpage').create();
console.log('The default user agent is ' + page.settings.userAgent);
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari 5.1.7';
console.log('using ' + page.settings.userAgent);

var pageName = 'http://localhost:43091/demo';

function getInfo(id){
    return JSON.parse(page.evaluate(function(id){
        var bool1 = document.getElementById(id);
        var rect = bool1.getBoundingClientRect();
        // console.log('bool1',bool1.value, bool1.checked, bool1.indeterminate, bool1.getTypedValue(), bool1.type, bool1.tagName);
        // var j = {
        //     value: bool1.getTypedValue(),
        //     cx: Math.floor((rect.left+rect.right)/2),
        //     cy: Math.floor((rect.top+rect.bottom)/2),
        // };
        // console.log(j);
        // console.log(JSON.stringify(j));
        return JSON.stringify({
            value: bool1.getTypedValue(),
            cx: Math.floor((rect.left+rect.right)/2),
            cy: Math.floor((rect.top+rect.bottom)/2),
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
    try{
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
        page.render('server/local-capture.png', {format: 'png', quality: '100'});
    }catch(err){
        console.log('ERROR. TESTING');
        console.log(err.stack);
    }
    phantom.exit();
}