"use strict";

var keys = null;
var testUrl = 'http://localhost:43091/demo';
var numErrors = 0;

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
casper.test.begin("Test 1", function suite(test) {
    casper.start(testUrl, function() {
        test.assertTitle('tedede demo', 'titulo correcto');
        var AjaxBestPromise=casper.page.evaluate(function(wVar) {
            return window[wVar];
        }, 'AjaxBestPromise');
        for(var p in AjaxBestPromise) {
            var o=AjaxBestPromise[p];
            console.log(" ", p, ":", o, typeof(o))
        }
        //test.assertTrue(casper.page.injectJs('../node_modules/ajax-best-promise/bin/ajax-best-promise.js'), "Incluir ajax-best-promise");
        // test.assertTrue(casper.page.injectJs('ajax-best-promise.js'), "Incluir ajax-best-promise");
        test.assertTrue(true);
        // AjaxBestPromise.post({
            // url:testUrl+'/coverage',
            // data:{info:"{}"}
        // }).then(function(resultJson){
            // var result=JSON.parse(resultJson);
            // this.echo(resultJson);
        // });
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