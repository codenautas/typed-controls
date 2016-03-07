"use strict";

var PORT = 43091;

var Path = require('path');
var winOS = Path.sep==='\\';

var _ = require('lodash');
var express = require('express');
var app = express();

var coverageON = process.argv.indexOf('--coverage') !== -1;

if(coverageON) {
    var im = require('istanbul-middleware');
}

// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var session = require('express-session');
// var Promises = require('best-promise');
// var fs = require('fs-promise');
// var readYaml = require('read-yaml-promise');
var extensionServeStatic = require('extension-serve-static');
// var jade = require('jade');

// app.use(cookieParser());
// app.use(bodyParser.urlencoded({extended:true}));

var html = require('js-to-html').html;
var changing = require('best-globals').changing;

app.get('/demo', function(req,res){
    res.end(html.html([
        html.head([
        //link rel="stylesheet" type="text/css" href="mystyle.css"> </head>.
            html.link({rel:'stylesheet', type:'text/css', href:'pdemo.css'}),
        ]),
        html.body({id:'elBody'},[
            html.h1("tedede demo for browser"),
            html.div([
                html.input({type: "checkbox", id:"bool1"}),
                html.label({"for": "bool1"}, "has tri-state booleans"),
            ]),
            html.div([
                html.label({"for": "text1"}, "text with empty"),
                html.input({type: "text", id:"text1", "accesskey": "t"}),
            ]),
            html.div({id:'bool2', "tedede-option-group": "bool2"},[
                html.input({type:'radio', name:'bool2', value:'true' , id:'bool2-true' }), html.label({"for":'bool2-true' ,id:'label-bool2-true' },"Sí"), html.br(),
                html.input({type:'radio', name:'bool2', value:'false', id:'bool2-false'}), html.label({"for":'bool2-false',id:'label-bool2-false'},"No"),
            ]),
            html.input({type: "text", id:"txtEmiter"}),
            html.pre({id: "messages"}),
            html.script({src:'lib4/ajax-best-promise.js'}),
            html.script({src:'lib3/best-globals.js'}),
            html.script({src:'lib2/js-to-html.js'}),
            html.script({src:'lib/tedede.js'}),
            html.script({src:'pdemo-client.js'}),
        ])
    ]).toHtmlDoc({title:'tedede demo'}));
});

app.use('/lib3',extensionServeStatic('./node_modules/best-globals', {staticExtensions: ['js']}));
app.use('/lib2',extensionServeStatic('./node_modules/js-to-html', {staticExtensions: ['js']}));
app.use('/lib4',extensionServeStatic('./node_modules/ajax-best-promise/bin', {staticExtensions:'js'}));
app.use('/lib',extensionServeStatic('./lib', {staticExtensions: ['js']}));

if(coverageON) {
    app.use('/demo/coverage', im.createHandler({ verbose: true, resetOnGet: true }));
    app.use(im.createClientHandler(__dirname, { matcher:function(req) {
        var parsed = require('url').parse(req.url);
        return parsed.pathname && parsed.pathname.match(/\.js$/) && parsed.pathname.match(/coverage/);
    }}));
}

app.use('/',extensionServeStatic('./server', {
    extensions: ['html', 'htm'], 
    index: 'index.html', 
    staticExtensions: ['', 'html', 'htm', 'png', 'jpg', 'jpeg', 'gif', 'js', 'css']
})); 

var pidBrowser;

var server = app.listen(PORT, function(){
    console.log('Listening on port %d', server.address().port);
    console.log('launch browser');
    var spawn = require('child_process').spawn;
    var args = process.argv;
    var phantomPath=process.env.TRAVIS && process.env.TRAVIS_NODE_VERSION<'4.0'?'phantomjs':'./node_modules/phantomjs-prebuilt/lib/phantom/'+(winOS?'bin/phantomjs.exe':'bin/phantomjs');
    var slimerPath=process.env.TRAVIS?'slimerjs':'./node_modules/slimerjs/lib/slimer/'+(winOS?'slimerjs.bat':'bin/slimerjs');
    
    pidBrowser = spawn(
        (process.env.TRAVIS && false?'casperjs':'./node_modules/casperjs/bin/'+(winOS?'casperjs.exe':'casperjs')),
        ['test',
         '--verbose',
         // '--loglevel=debug',
         //'--value=true',
         //'--engine=slimerjs',
         //'--fail-fast',
         Path.resolve(coverageON ? './server/ctest-coverage.js' : './server/ctest.js')
        ],
        { stdio: 'inherit' , env: changing(process.env,{PHANTOMJS_EXECUTABLE: phantomPath, SLIMERJS_EXECUTABLE:slimerPath})}
    );
    /*
    pidBrowser = spawn(
        'node',
        [Path.normalize('d:/cnautas/prog.js')],
        { stdio: 'inherit' , cwd: process.cwd()}
    );
    */
    pidBrowser.on('close', function (code, signal) {
        console.log('browser closed', code, signal);
        pidBrowser = null;
        if(!(process.argv.indexOf('--hold')>0)){
            process.exit(code);
        }
    });
    console.log('all launched');
});

process.on('exit', function(code){
    console.log('process exit',code);
    if(pidBrowser){
        pidBrowser.kill('SIGHUP');
        console.log('SIGHUP sended to browser');
    }else{
        console.log('browser already closed');
    }
});


process.on('uncaughtException', function(err){
    console.log('process NOT CAPTURED ERROR',err);
    console.log(err.stack);
    process.exit(1);
});

