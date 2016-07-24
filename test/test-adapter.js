"use strict";

window.changing=bestGlobals.changing;
window.BestTypes=TypedControls.BestTypes;
window.html=jsToHtml.html;

var toTest = {
    "text": [{
        validData:[
            {value:null        , display:''          , valueEmpty:false, htmlDisplay: ''         },
            {value:'hello'     , display:'hello'     , valueEmpty:false, htmlDisplay: 'hello'    },
            {value:'hi\nWorld' , display:'hi\nWorld' , valueEmpty:false, htmlDisplay: 'hi\nWorld', multiline:true},
            {value:''          , display:''          , valueEmpty:true , htmlDisplay: ''         }
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
    "number": [{
        validData:[
            {value:null        , display:''          , },
            {value:42          , display:'42'        , },
            {value:0           , display:'0'         , },
            {value:12345.125   , display:'12345.125' , htmlDisplay: 
                '<span class="number_miles">12</span>'+
                '<span class="number_miles">345</span>'+
                '<span class="number_dot">.</span>'+
                '<span class="number_decimals">125</span>'    
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
    },{
        typeInfo:{
            typeName:"number",
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
    "date": [{
        validData:[
            {value:null                   , display:'' },
            {value:new Date(2015,12-1,31) , display:'31/12/2015'  , htmlDisplay:
                '<span class="date_day">31</span>'+
                '<span class="date_sep">/</span>'+
                '<span class="date_month">12</span>'+
                '<span class="date_sep">/</span>'+
                '<span class="date_year">2015</span>',
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
            {value:new Date(), errRegexp:/date must be an absolute date without time/},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }],
    "boolean": [{
        validData:[
            {value:null , display:''   , htmlDisplay:''},
            {value:true , display:'Yes', htmlDisplay:'<span class="bool_true">Yes</span>'},
            {value:false, display:'No' , htmlDisplay:'<span class="bool_false">No</span>'},
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
};

toTest["text_no_empty"] = []
toTest["text_no_empty"][0] = changing(toTest["text"][0],{});
toTest["text_no_empty"][0].validData = toTest["text"][0].validData.filter(function(data){ return data.value !=='' && !data.multiline; });
toTest["text_no_empty"][0].invalidData = toTest["text"][0].invalidData.concat({value:'', errRegexp:/text cannot be empty/});

describe("adapter",function(){
    describe("for text without empty strings",function(){
        var inputElement;
        var divElement;
        beforeEach(function(done){
            inputElement = html.input().create();
            divElement = html.div().create();
            TypedControls.adaptElement(inputElement,'text_no_empty');
            TypedControls.adaptElement(divElement,'text_no_empty');
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
            var original_validateTypedData=divElement.validateTypedData;
            divElement.validateTypedData=function(data){
                expect(data).to.be('alfa');
                throw new Error('invalid data "alfa"');
            };
            expect(function(){
                divElement.setTypedValue('alfa');
            }).to.throwError(/invalid data "alfa"/);
            expect(divElement.getTypedValue()).to.be('untouch');
            divElement.validateTypedData=original_validateTypedData;
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
    describe("when addapt element with options must control the structure",function(){
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
    describe("boolean with options implemented with radiobuttons",function(){
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
    Object.keys(BestTypes).forEach(function(typeName){ BestTypes[typeName].domFixtures.forEach(function(def){ toTest[typeName].forEach(function(testFixture){
        describe("for type '"+typeName+"' and fixture "+JSON.stringify(def), function(){
            var theElement;
            var theBestElement;
            var theElementErr;
            var skip;
            beforeEach(function(done){
                try{
                    theElement = TypedControls.createFromFixture(def, testFixture.typeInfo).create();
                    theBestElement = TypedControls.bestCtrl(testFixture.typeInfo||typeName).create();
                    document.body.appendChild(theElement);
                    document.body.appendChild(theBestElement);
                }catch(err){
                    theElementErr = err;
                    theElement = null;
                }
                skip = NOT_SUPPORTED_SITUATION({
                    when: def.attributes.type==='date' || theElementErr,
                    must: theElement && theElement.type==='date',
                    description: 'input of type date',
                    excluding: 'Firefox 31.0, Firefox 39.0, Firefox 43.0, Firefox 44.0, Firefox 45.0, Firefox 47.0, PhantomJS 2.1.1, IE 11.0'.split(', '),
                    context: theElementErr
                });
                if(!skip){
                    if(theElement==null){
                        console.log('*****************************');
                        console.log(testFixture);
                        console.log('---------------------');
                    }
                    TypedControls.adaptElement(theElement,testFixture.typeInfo||typeName);
                    TypedControls.adaptElement(theBestElement,testFixture.typeInfo||typeName);
                    document.body.appendChild(theElement);
                }
                done();
            });
            //if(typeName=='enum'){console.log("#############3",def)};
            testFixture.validData.map(function(data){
                it("sets and get "+data.value+" in "+def.tagName,function(){
                    if(skip) return;
                    //console.log("data",data,"data.value",data.value);
                    theElement.setTypedValue(data.value);
                    if('htmlDisplay' in data && (def.tagName!=='input' && def.tagName!=='textarea' && !def.creatorFunction)){
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
                            expect(theElement[inspect]).to.eql('display' in data?data.display:data.value);
                        }
                    }
                    expect(theElement.getTypedValue()).to.eql(data.value);
                    if(typeName==='text'){
                        expect(theElement.valueEmpty).to.eql(data.valueEmpty);
                    }
                });
                it("sets and get "+data.value+" for best ctrl",function(){
                    if(skip) return;
                    //console.log("data",data,"data.value",data.value);
                    theBestElement.setTypedValue(data.value);
                    if(!data.multiline){
                        var inspect = def.tagName==='input' || def.tagName==='textarea'?'value':'textContent';
                        if(theBestElement.type==='checkbox'){
                            expect(theBestElement.indeterminate).to.be(data.value===null);
                            expect(theBestElement.checked).to.be(data.value===true);
                        }
                        if('value' in theBestElement && !('textContent' in theBestElement)){
                            inspect = 'value';
                        }else if(!('value' in theBestElement) && 'textContent' in theBestElement && theBestElement.childElementCount==0){
                            inspect = 'textContent';
                        }else{
                            inspect = null;
                        }
                        if(inspect){
                            expect(theBestElement[inspect]).to.eql('display' in data?data.display:data.value);
                        }
                    }
                    expect(theBestElement.getTypedValue()).to.eql(data.value);
                    if(typeName==='text'){
                        expect(theBestElement.valueEmpty).to.eql(data.valueEmpty);
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
                ['normal', 'best'].forEach(function(mode){
                    it("reject invalid value "+def.value+" mode "+mode,function(){
                        if(skip) return;
                        var UNTOUCH = testFixture.validData[1].value;
                        var thisElement = mode=='normal' ? theElement : theBestElement;
                        thisElement.setTypedValue(UNTOUCH);
                        expect(function(){
                            thisElement.setTypedValue(def.value);
                        }).to.throwError(def.errRegexp||/Not a .* in input/);
                        expect(thisElement.getTypedValue()).to.eql(UNTOUCH);
                    });
                });
            });
        });
    }); }); });
});