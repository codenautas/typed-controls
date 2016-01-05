casper.on("remote.message", function(msg) {
    this.echo("Console: " + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("page Error: " + msg);
});

casper.on("resource.error", function(msg, trace) {
    this.echo("Res.Error: " + msg);
});

function getInfo(elemName) {
    return casper.page.evaluate(function(id) {
        var theElement = document.getElementById(id);
        var rect = theElement.getBoundingClientRect();
        return {
            value: 'getTypedValue' in theElement?theElement.getTypedValue():'not adapted',
            cx: Math.floor((rect.left+rect.right)/2),
            cy: Math.floor((rect.top+rect.bottom)/2),
            isActive: document.activeElement === theElement
        }
    }, elemName);
}
function sendEvent(event, elem) {
    casper.page.sendEvent(event, elem.cx, elem.cy);
}

function sendKey(key){
    with(casper.page) {
        sendEvent('keydown', key);
        sendEvent('keyup', key);
    }
}

casper.test.begin("Test checkbox", function(test) {
    casper.start('http://localhost:43091/demo', function() {
        test.assertTitle('tedede demo', 'titulo correcto');
        test.assertExists('#bool1', 'tengo bool1');
        var boolN = 'bool1';
        var bool1 = getInfo(boolN);
        test.assert(bool1.value === false);
        sendEvent('click', bool1);
        bool1 = getInfo(boolN);
        test.assert(bool1.value === true);
        sendKey(casper.page.event.key.Space);
        bool1 = getInfo(boolN);
        test.assert(bool1.value === false);

    }).run(function() {
        test.done();
    });    
});
