console.log('starting phantom');

var page = require('webpage').create();
console.log('The default user agent is ' + page.settings.userAgent);
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari 5.1.7';
console.log('using ' + page.settings.userAgent);

var pageName = 'http://localhost:43091/demo';

function getInfo(id){
    return page.evaluate(function(id){
        var bool1 = document.getElementById(id);
        var rect = bool1.getBoundingClientRect();
        return {
            value: bool1.getTypedValue(),
            cx: Math.floor((rect.left+rect.right)/2),
            cy: Math.floor((rect.top+rect.bottom)/2),
        };
    }, id);
}

page.open(pageName, function(status, moreInfo) {
    if(status !== 'success') {
        console.log('Unable to access page', pageName, status, moreInfo);
        phantom.exit();
    }else{
        var bool1 = getInfo('bool1'); 
        console.log('first value',bool1.value);
        page.sendEvent('click', bool1.cx, bool1.cy);
        console.log('click', bool1.cx, bool1.cy);
        //setTimeout(function(){
            bool1 = getInfo('bool1'); 
            console.log('then value',bool1.value);
            page.render('server/local-capture.png', {format: 'png', quality: '100'});
            phantom.exit();
        //},1000);
    }
});


page.onConsoleMessage = function(msg) {
  console.log('#',msg);
}
