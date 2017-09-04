"use strict";

var changing=require('best-globals').changing;
var likeAR=require('like-ar');
var html=require('js-to-html').html;
var BestTypes=TypedControls.BestTypes;
var discrepances = require('discrepances');

var testTypes={};
['bigint'].forEach(function(typeName){
    testTypes[typeName] = new TypeStore.type[typeName]();
});

TypeStore.locale.en=TypeStore.locale.en||TypeStore.locale;
TypeStore.locale=TypeStore.locale.es;
TypeStore.messages.en=TypeStore.messages.en||TypeStore.messages;
TypeStore.messages=TypeStore.messages.es;

var localDefinitions={
    decimalSeparator:'.'
};

var toTest = {
    "text": [{
        validData:[
            {value:null        , display:''          , valueEmpty:false, htmlDisplay: ''         },
            {value:'hello'     , display:'hello'     , valueEmpty:false, htmlDisplay: '<span class="text">hello</span>'},
            // skip: {value:'hi\nWorld' , display:'hi\nWorld' , valueEmpty:false, htmlDisplay: 'hi\nWorld', multiline:true},
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            // {value:'sarasa'},
            // {value:'0'},
            {value:0},
            {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }], 
    "double": [{
        validData:[
            {value:null        , display:''          , },
            {value:42          , display:'42'        , },
            {value:0           , display:'0'         , },
            {value:12345.125   , display:'12345,125' , htmlDisplay: 
                '<span class="number">'+
                    '<span class="number-miles">12</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">345</span>'+
                    '<span class="number-dot">,</span>'+
                    '<span class="number-decimals">125</span>'+
                '</span>'
            },
            {value:812345     , display:'812345' },
            {value:1812345     , display:'1812345'},
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            // {value:0},
            // {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }],
    "integer": [,{
        typeInfo:{
            typeName:"integer",
            maxValue:9,
            minValue:0,
            onlyInt:true
        },
        validData:[
            {value:null        , display:''          , },
            {value:2           , display:'2'         , },
            {value:0           , display:'0'         , },
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            {value:-1, errRegexp:/The value is lower than .*/},
            {value:32, errRegexp:/The value is greater than .*/},
            {value:0.00001, errRegexp:/The value is not an integer/},
            {value:8.5 , errRegexp:/The value is not an integer/},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }],
    "number": [],
    "date": [{
        validData:[
            {value:null                   , display:'' },
            {value:bestGlobals.date.iso('2015-12-31') , display:'31/12/2015'  , htmlDisplay:
                '<span class="date">'+
                '<span class="date-day">31</span>'+
                '<span class="date-sep">/</span>'+
                '<span class="date-month">12</span>'+
                '<span class="date-sep">/</span>'+
                '<span class="date-year">2015</span>'+
                '</span>',
                valueISO: '2015-12-31'
            },
        ],
        invalidData:[
            {value:true},
            // {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            {value:0},
            {value:32},
            {value:new Date(), errRegexp:/invalid date .*because it has time/},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }],
    "boolean": [{
        validData:[
            {value:null , display:''   , htmlDisplay:''},
            {value:true , display:'sí' , htmlDisplay:'<span class="boolean"><span class="boolean-true">sí</span></span>'},
            {value:false, display:'no' , htmlDisplay:'<span class="boolean"><span class="boolean-false">no</span></span>'},
        ],
        invalidData:[
            // {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            {value:0},
            {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }],
    /*
    "enum": [{
        typeInfo:{
            typeName:"enum",
            showOption: true,
            options:[
                {option: 'a', label: 'es una vocal'      },
                {option: 'b', label: 'es una consonante' },
                {option:  3 , label: 'es un número'      },
                {option: 'd', label: 'otra', more: true  }
            ]
        },
        validData:[
            {value:null        , display:''         , },
            {value:'a'         , display:''         , },
            {value:'b'         , display:''         , },
            {value: 3          , display:''         , },
            {value:'d'         , display:''         , },
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            // {value:0},
            // {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }],
    */
    "FROM:type-store":[
    ],
    "ARRAY:text":[{
        validData:[
            {value:null        , display:''         , },
            //TODO: decide this: {value:[]          , display:''         , },
            {value:['a']       , display:'a'        , },
            {value:['b','c']   , display:'b;c'      , },
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            {value:0},
            {value:32},
            {value:{}},
            {value:/regexp/},
        ]
    }],
    jsonb:[{ // TODO add test for jsonb
        validData:[
            {value:null        , display:''         , },
            {value:['a']       , display:'["a"]'    , },
            {value:{a:'a'}     , display:'{"a":"a"}', },
            /*
            {value:['a']       , display:'a'        , },
            {value:{a:'a'}     , display:'b;c'      , },
            */
        ],
        invalidData:[
        ]
    }],
    interval:[{ // TODO add test for jsonb
        validData:[
            {value:null        , display:''         , },
            {value:new bestGlobals.TimeInterval({days:1})    , display:'1D'       , },
            /*
            {value:['a']       , display:'a'        , },
            {value:{a:'a'}     , display:'b;c'      , },
            */
        ],
        invalidData:[
        ]
    }],
    timestamp:[{ // TODO add test for jsonb
        validData:[
            {value:null        , display:''         , },
            {value:bestGlobals.datetime.iso('2019-10-20 10:20:30'), display:'2019-10-20 10:20:30.000'},
        ],
        invalidData:[
        ]
    }],
    "decimal": [{
        validData:[
            {value:null        , display:''          , },
            {value:42          , display:'42'        , },
            {value:0           , display:'0'         , },
            {value:new Big('12345.1259876543219876543210101010101010101'), 
                display:'12345,1259876543219876543210101010101010101', 
                display_number:'12345'+localDefinitions.decimalSeparator+'1259876543219876543210101010101010101', 
                htmlDisplay: 
                
                '<span class="number">'+
                    '<span class="number-miles">12</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">345</span>'+
                    '<span class="number-dot">,</span>'+
                    '<span class="number-decimals">1259876543219876543210101010101010101</span>'+
                '</span>'
                //'<span class="number_miles">12</span>'+
                //'<span class="number_miles">345</span>'+
                //'<span class="number_dot">.</span>'+
                //'<span class="number_decimals">1259876543219876543210101010101010101</span>'    
            },
            {value:812345     , display:'812345' , htmlDisplay: 
                '<span class="number">'+
                    '<span class="number-miles">812</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">345</span>'+
                '</span>'
                //'<span class="number_miles">812</span>'+
                //'<span class="number_miles">345</span>'
            },
            {value:1812345     , display:'1812345' , htmlDisplay: 
                '<span class="number">'+
                    '<span class="number-miles">1</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">812</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">345</span>'+
                '</span>'
                //'<span class="number_miles">1</span>'+
                //'<span class="number_miles">812</span>'+
                //'<span class="number_miles">345</span>'
            },
            {value:testTypes.bigint.fromString('-102345678901133557') 
                , display:'-102345678901133557' , htmlDisplay: 
                '<span class="number">'+
                    '<span class="number-sign">-</span>'+
                    '<span class="number-miles">102</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">345</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">678</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">901</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">133</span>'+
                    '<span class="number-separator"></span>'+
                    '<span class="number-miles">557</span>'+
                '</span>'
                //'<span class="number_sign">-</span>'+
                //'<span class="number_miles">102</span>'+
                //'<span class="number_miles">345</span>'+
                //'<span class="number_miles">678</span>'+
                //'<span class="number_miles">901</span>'+
                //'<span class="number_miles">133</span>'+
                //'<span class="number_miles">557</span>'
            },
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'sarasa'},
            {value:'0'},
            // {value:0},
            // {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }], 
};

var text_empty_allowed = {typeName:'text', allowEmptyText:true};

toTest["text_empty_allowed"] = []
toTest["text_empty_allowed"][0] = changing(toTest["text"][0],{typeInfo:text_empty_allowed});
// FUTURE toTest["text_empty_allowed"][0].validData = toTest["text"][0].validData.concat({value:''          , display:''          , valueEmpty:true , htmlDisplay: ''});
toTest["text"][0].invalidData = toTest["text"][0].invalidData.concat({value:'', errRegexp:/text cannot be empty/});

toTest.hugeint = toTest.number;
toTest.integer = toTest.number;
toTest.bigint = toTest.number;

describe("adapter",function(){
    describe("for text without empty strings",function(){
        var inputElement;
        var divElement;
        beforeEach(function(done){
            inputElement = html.input().create();
            divElement = html.div().create();
            TypedControls.adaptElement(inputElement,TypeStore.typerFrom({typeName:'text'}));
            TypedControls.adaptElement(divElement  ,TypeStore.typerFrom({typeName:'text'}));
            done();
        });
        it("sets and get normal string in input",function(){
            inputElement.setTypedValue('the value');
            expect(inputElement.value).to.be('the value');
            expect(inputElement.getTypedValue()).to.be('the value');
        });
        it("set and gets null in input",function(){
            inputElement.setTypedValue(null);
            expect(inputElement.value).to.be('');
            expect(inputElement.getTypedValue()).to.be(null);
        });
        it("sets and get normal string in div",function(){
            divElement.setTypedValue('the value');
            expect(divElement.textContent).to.be('the value');
            expect(divElement.getTypedValue()).to.be('the value');
        });
        it("set and gets null in div",function(){
            divElement.setTypedValue(null);
            expect(divElement.textContent).to.be('');
            expect(divElement.getTypedValue()).to.be(null);
        });
        it("reject invalid value",function(){
            divElement.setTypedValue('untouch');
            divElement.controledTypeInfo.validateTypedData=function(data){
                expect(data).to.be('alfa');
                throw new Error('invalid data "alfa"');
            };
            expect(function(){
                divElement.setTypedValue('alfa');
            }).to.throwError(/invalid data "alfa"/);
            expect(divElement.getTypedValue()).to.be('untouch');
        });
        it("reject empty value",function(){
            divElement.setTypedValue('untouched');
            expect(function(){
                divElement.setTypedValue('');
            }).to.throwError(/text cannot be empty/);
            expect(divElement.getTypedValue()).to.be('untouched');
        });
        function testDisable(element){
            expect(element.disable).to.be.a(Function);
            element.disable(true);
            expect(element.disabled).to.ok();
            element.disable(false);
            expect(element.disabled).to.not.ok();
        }
        it("have disable function inputElement",function(){ testDisable(inputElement);});
        it("have disable function divElement"  ,function(){ testDisable(divElement);  });
    });
    describe.skip("when addapt element with options must control the structure",function(){
        it("must control options no less options",function(){
            var theElement=html.div({"typed-controls-option-group": "simple-option"},[
                html.input({type:'radio', value:'true' }), html.label({"for-value":'true' },"Sí"), html.br(),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                TypedControls.adaptElement(theElement, "boolean");
            }).to.throwError(/incomplete options control/);
        })
        it("must control duplicate options options",function(){
            var theElement=html.div({"typed-controls-option-group": "simple-option"},[
                html.input({type:'radio', value:'true' }), html.label({"for-value":'true' },"Sí"), html.br(),
                html.input({type:'radio', value:'true' }), html.label({"for-value":'true' },"Sí"), html.br(),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                TypedControls.adaptElement(theElement, "boolean");
            }).to.throwError(/duplicate options in options control/);
        })
        it("must control options more options",function(){
            var theElement=html.div({"typed-controls-option-group": "simple-option"},[
                html.input({type:'radio', value:'true' }), html.label({"for-value":'true' },"Sí"), html.br(),
                html.input({type:'radio', value:'false'}), html.label({"for-value":'false'},"Sí"), html.br(),
                html.input({type:'radio', value:'x'    }), html.label({"for-value":'x'    },"Sí"), html.br(),
            ]).create();
            document.body.appendChild(theElement);
            expect(function(){
                TypedControls.adaptElement(theElement, "boolean");
            }).to.throwError(/invalid options in options control/);
        })
    });
    describe.skip("boolean with options implemented with radiobuttons",function(){
        var theElement;
        beforeEach(function(){
            theElement=html.div({id:'bool9', "typed-controls-option-group": "simple-option"},[html.div([
                html.input({type:'radio', value:'true' }), html.label({"for-value":true },"Sí"), html.br(),
                html.input({type:'radio', value:'false'}), html.label({"for-value":false},"No"),
            ])]).create();
            document.body.appendChild(theElement);
            TypedControls.adaptElement(theElement, "boolean");
        });
        afterEach(function(){
            document.body.removeChild(theElement);
        });
        it("must complete the id and name",function(){
            var expected=html.div([
                html.div({id:'bool9', "typed-controls-option-group": "bool9"},[html.div([
                    html.input({type:'radio', value:'true' , name:'bool9', id:'bool9-true' }), html.label({"for-value":true , "for":'bool9-true' },"Sí"), html.br(),
                    html.input({type:'radio', value:'false', name:'bool9', id:'bool9-false'}), html.label({"for-value":false, "for":'bool9-false'},"No"),
                ])])
            ]).create().innerHTML;
            expect(expected).to.eql(theElement.outerHTML);
        });
        it("must be null by default",function(){
            expect(document.getElementById('bool9-true').checked).to.be(false);
            expect(document.getElementById('bool9-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(null);
            expect(theElement.contentEditable).to.be('inherit');
        });
        it("must get true for true",function(){
            theElement.setTypedValue(true);
            expect(document.getElementById('bool9-true').checked).to.be(true);
            expect(document.getElementById('bool9-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(true);
        });
        it("must get false for false and can change",function(){
            theElement.setTypedValue(false);
            expect(document.getElementById('bool9-true').checked).to.be(false);
            expect(document.getElementById('bool9-false').checked).to.be(true);
            expect(theElement.getTypedValue()).to.be(false);
            theElement.setTypedValue(null);
            expect(document.getElementById('bool9-true').checked).to.be(false);
            expect(document.getElementById('bool9-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(null);
            theElement.setTypedValue(true);
            expect(document.getElementById('bool9-true').checked).to.be(true);
            expect(document.getElementById('bool9-false').checked).to.be(false);
            expect(theElement.getTypedValue()).to.be(true);
            theElement.setTypedValue(false);
            expect(document.getElementById('bool9-true').checked).to.be(false);
            expect(document.getElementById('bool9-false').checked).to.be(true);
            expect(theElement.getTypedValue()).to.be(false);
        });
        it("must disable internal inputs",function(){
            expect(document.getElementById('bool9-true').disabled).to.be(false);
            expect(document.getElementById('bool9-false').disabled).to.be(false);
            theElement.disable(true);
            expect(document.getElementById('bool9-true').disabled).to.be(true);
            expect(document.getElementById('bool9-false').disabled).to.be(true);
            theElement.disable(false);
            expect(document.getElementById('bool9-true').disabled).to.be(false);
            expect(document.getElementById('bool9-false').disabled).to.be(false);
        });
    });
    likeAr(toTest).forEach(function(testFixtures, testTypeName){ testFixtures.forEach(function(testFixture){
      testFixture.typeInfo=testFixture.typeInfo||{typeName:testTypeName};
      var typeName=testFixture.typeInfo.typeName;
      if(!TypeStore.type[typeName]){
          console.log('xxxxxxxxxxx-sin-typer',typeName);
      }
      var typer = new TypeStore.type[typeName]()
      typer.getDomFixtures().forEach(function(def,i){
        if(testFixture.tagName==='input') return;
        describe("for type '"+testTypeName+"' and fixture "+JSON.stringify(def), function(){
            var theElement;
            var theBestElement;
            var theElementErr;
            var skip;
            beforeEach(function(done){
                try{
                    theElement = TypedControls.createFromFixture(def, testFixture.typeInfo).create();
                    document.body.appendChild(theElement);
                }catch(err){
                    theElementErr = err;
                    theElement = null;
                }
                skip = NOT_SUPPORTED_SITUATION({
                    when: def.attributes.type==='date' || theElementErr,
                    must: theElement && theElement.type==='date',
                    description: 'input of type date',
                    excluding: 'Firefox 31.0, Firefox 39.0, Firefox 43.0, Firefox 44.0, Firefox 45.0, Firefox 47.0, Firefox 49.0, Firefox 50.0, Firefox 52.0, Firefox 53.0, Firefox 54.0, PhantomJS 2.1.1, IE 11.0'.split(', '),
                    context: theElementErr
                });
                if(!skip){
                    if(theElement==null){
                        console.log('*****************************');
                        console.log(testFixture);
                        console.log('---------------------');
                    }
                    try{
                        if(!TypeStore.type[testFixture.typeInfo.typeName]){
                            console.log('xxxxxxxxxxx=-',testFixture.typeInfo.typeName);
                        }
                    }catch(err){
                        console.log('xxxxxxxxxxx=E',testFixture.typeInfo);
                    }
                    var typer=TypeStore.typerFrom(testFixture.typeInfo);
                    TypedControls.adaptElement(theElement,typer);
                }
                done();
            });
            //if(typeName=='enum'){console.log("#############3",def)};
            testFixture.validData.map(function(data){
                it("sets and get "+data.value+" in "+def.tagName,function(){
                    if(skip) return;
                    theElement.setTypedValue(data.value);
                    console.log("xxxxxxxxx-data.value",data.value,theElement.value);
                    if('htmlDisplay' in data && (def.tagName!=='input' && def.tagName!=='textarea' && !def.creatorFunction)){
                        console.log('xxxxxxxxxxxxxx-def',def, typer, typer.typeName);
                        expect(theElement.innerHTML).to.be(data.htmlDisplay);
                    }
                    if(!data.multiline){
                        var inspect = def.tagName==='input' || def.tagName==='textarea'?'value':'textContent';
                        if(def.attributes.type==='checkbox'){
                            expect(theElement.indeterminate).to.be(data.value===null);
                            expect(theElement.checked).to.be(data.value===true);
                        }else if(def.attributes.type==='date' && data.value!=null){
                            expect(theElement.value).to.eql(data.valueISO);
                        }else if(!def.creatorFunction){
                            if(theElement.type && theElement.type!='text'){
                                var attrDisplay='display_'+theElement.type;
                                expect(theElement[inspect]).to.eql(attrDisplay in data?data[attrDisplay]:('display' in data?data.display:data.value));
                            }else{
                                expect(theElement[inspect]).to.eql('display' in data?data.display:data.value);
                            }
                        }
                    }
                    if(data.value==null || ! data.value.sameValue || !data.value.sameValue(theElement.getTypedValue())){
                        expect(theElement.getTypedValue()).to.eql(data.value);
                    }
                    if(typeName==='text'){
                        if(!"skip"){
                            expect(theElement.valueEmpty).to.eql(data.valueEmpty);
                        }
                    }
                });
                it("send the right event "+data.value+" in "+def.tagName,function(done){
                    //console.log("TYPE", typeName, "TAG", def.tagName, "DATA", data ? data : 'null');
                    if(!def.mainUpdateEventName || skip) {
                        done();
                        return;
                    }
                    //console.log(typeName, def.tagName, "updEVENT", def.mainUpdateEventName)
                    theElement.setTypedValue(data.value);
                    theElement.addEventListener('update', function(){
                        try{
                            expect(this.getTypedValue()).to.eql(data.value);
                            done();
                        }catch(err){
                            done(err);
                        }
                    });
                    var evt=new CustomEvent(def.mainUpdateEventName);
                    //var evt=new CustomEvent('blur');
                    theElement.dispatchEvent(evt);
                });
            });
            testFixture.invalidData.forEach(function(def){
                it("reject invalid value "+JSON.stringify(def.value),function(){
                    if(skip) return;
                    var UNTOUCH = testFixture.validData[1].value;
                    var thisElement = theElement ;
                    thisElement.setTypedValue(UNTOUCH);
                    expect(function(){
                        thisElement.setTypedValue(def.value);
                    }).to.throwError(def.errRegexp||/[Nn]o[tn] an? .* in (input|type-store)/);
                    // }).to.throwError(def.errRegexp||/Not an? .* in/);
                    expect(thisElement.getTypedValue()).to.eql(UNTOUCH);
                });
            });
        });
      });
    }); }); 
});