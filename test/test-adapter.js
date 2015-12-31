"use strict";

var toTest = {
    "text": {
        validData:[
            {value:null        , display:''          , valueEmpty:false, htmlDisplay: ''         },
            {value:'hello'     , display:'hello'     , valueEmpty:false, htmlDisplay: 'hello'    },
            {value:'hi\nWorld' , display:'hi\nWorld' , valueEmpty:false, htmlDisplay: 'hi\nWorld', multiline:true},
            {value:''          , display:''          , valueEmpty:true , htmlDisplay: ''         }
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:0},
            {value:32},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    }, 
    "number": {
        validData:[
            {value:null        , display:''          , },
            {value:42          , display:'42'        , },
            {value:0           , display:'0'         , },
            {value:12345.125   , display:'hello'     , htmlDisplay: 
                '<span class="number_miles">12</span>'+
                '<span class="number_miles">345</span>'+
                '<span class="number_dot">.</span>'+
                '<span class="number_decimals">125</span>'    
            },
        ],
        invalidData:[
            {value:true},
            {value:new Date()},
            {value:'0'},
            {value:{}},
            {value:[]},
            {value:/regexp/},
        ]
    },
    "date": {
        validData:[
        ],
        invalidData:[
        ]
    },
    "boolean": {
        validData:[
        ],
        invalidData:[
        ]
    } 
};

toTest["text_no_empty"] = changing(toTest["text"],{});
toTest["text_no_empty"].validData = toTest["text"].validData.filter(function(data){ return data.value !=='' && !data.multiline; });
toTest["text_no_empty"].invalidData = toTest["text"].invalidData.concat({value:'', errRegexp:/text cannot be empty/});
toTest["text_no_empty"].invalidData = toTest["text"].invalidData//.concat({value:'', errRegexp:/text cannot be empty/});

describe("adapter",function(){
    describe("for text without empty strings",function(){
        var inputElement;
        var divElement;
        beforeEach(function(done){
            inputElement = html.input().create();
            divElement = html.div().create();
            Tedede.adaptElement(inputElement,'text_no_empty');
            Tedede.adaptElement(divElement,'text_no_empty');
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
            sinon.stub(divElement,'validateTypedData', function(data){
                expect(data).to.be('alfa');
                throw new Error('invalid data "alfa"');
            });
            expect(function(){
                divElement.setTypedValue('alfa');
            }).to.throwError(/invalid data "alfa"/);
            expect(divElement.getTypedValue()).to.be('untouch');
            divElement.validateTypedData.restore();
        });
        it("reject empty value",function(){
            divElement.setTypedValue('untouched');
            expect(function(){
                divElement.setTypedValue('');
            }).to.throwError(/text cannot be empty/);
            expect(divElement.getTypedValue()).to.be('untouched');
        });
    });
    Object.keys(BestTypes).forEach(function(typeName){ BestTypes[typeName].domFixtures.forEach(function(def){
        describe("for type '"+typeName+"' and fixture "+JSON.stringify(def), function(){
            var theElement;
            var skip;
            beforeEach(function(done){
                theElement = Tedede.createFromFixture(def).create();
                Tedede.adaptElement(theElement,typeName);
                document.body.appendChild(theElement);
                done();
            });
            toTest[typeName].validData.map(function(data){
                it("sets and get "+data.value+" in "+def.tagName,function(){
                    if(skip) return;
                    theElement.setTypedValue(data.value);
                    if('htmlDisplay' in data && (def.tagName!=='input' && def.tagName!=='textarea')){
                        expect(theElement.innerHTML).to.be(data.htmlDisplay);
                    }
                    if(!data.multiline){
                        var inspect = def.tagName==='input' || def.tagName==='textarea'?'value':'textContent';
                        expect(theElement[inspect]).to.eql(coalesce(data.value,''));
                    }
                    expect(theElement.getTypedValue()).to.eql(data.value);
                    if(typeName==='text'){
                        expect(theElement.valueEmpty).to.eql(data.valueEmpty);
                    }
                });
            });
            toTest[typeName].invalidData.forEach(function(def){
                it("reject invalid value "+def.value,function(){
                    if(skip) return;
                    var UNTOUCH = toTest[typeName].validData[1].value;
                    theElement.setTypedValue(UNTOUCH);
                    expect(function(){
                        theElement.setTypedValue(def.value);
                    }).to.throwError(def.errRegexp||/Not a .* in input/);
                    expect(theElement.getTypedValue()).to.eql(UNTOUCH);
                });
            });
        });
    }); });
    describe("for boolean type",function(){
        [
            {tagName:'div'  , type:''        , html:true , show:true }, 
            {tagName:'input', type:'text'    , html:false, show:true }, 
            {tagName:'input', type:'checkbox', html:false, show:false}
        ].forEach(function(def){
            var theElement;
            beforeEach(function(done){
                theElement = html[def.tagName]({type:def.type}).create();
                Tedede.adaptElement(theElement,'boolean');
                done();
            });
            [
                {value:true , display:'Sí', htmlDisplay:'<span class="bool_true">Sí</span>' },
                {value:false, display:'no', htmlDisplay:'<span class="bool_false">no</span>'},
                {value:null , display:''  , htmlDisplay:''},
            ].map(function(data){
                it("sets and get "+data.value+" in div",function(){
                    theElement.setTypedValue(data.value);
                    if(def.show){
                        expect(coalesce(theElement.value, theElement.textContent)).to.be(data.display);
                    }else{
                        expect(theElement.indeterminate).to.be(data.value===null);
                        expect(theElement.checked).to.be(data.value===true);
                    }
                    if(def.html){
                        expect(theElement.innerHTML).to.be(data.htmlDisplay);
                    }
                    expect(theElement.getTypedValue()).to.be(data.value);
                });
            });
            it("reject invalid value",function(){
                var UNTOUCH = true;
                theElement.setTypedValue(UNTOUCH);
                expect(function(){
                    theElement.setTypedValue('sarasa');
                }).to.throwError(/Not a boolean in input/);
                expect(theElement.getTypedValue()).to.be(UNTOUCH);
            });
        });
    });
    describe("for date type",function(){
        [
            {tagName:'div'  , type:''        , html:true , show:true }, 
            {tagName:'input', type:'text'    , html:false, show:true }, 
            {tagName:'input', type:'date'    , html:false, show:true }
        ].forEach(function(def){
            var theElement;
            var skip;
            beforeEach(function(done){
                var theElementErr=null;
                try{
                    theElement = html[def.tagName]({type:def.type}).create();
                }catch(err){
                    theElement = null;
                    theElementErr = err;
                }
                /*
                var theBox = html.div({style:'border: 1px solid green;'},[
                    html.span({style:'font-size:80%; color:#DDD;'},JSON.stringify(def))                    
                ]).create();
                theBox.appendChild(theElement);
                document.body.appendChild(theBox); 
                */
                skip = NOT_SUPPORTED_SITUATION({
                    when: def.type==='date',
                    must: theElement && theElement.type==='date',
                    description: 'input of type date',
                    excluding: 'Firefox 34.0, Firefox 43.0, IE 11.0'.split(', '),
                    context: theElementErr
                });
                if(!skip){
                    Tedede.adaptElement(theElement,'date');
                }
                done();
            });
            [
                {value:null                 , display:''  , htmlDisplay:''},
                {value:new Date(2015,12-1,31) , display:'31/12/2015'  , htmlDisplay:
                    '<span class="date_day">31</span>'+
                    '<span class="date_sep">/</span>'+
                    '<span class="date_month">12</span>'+
                    '<span class="date_sep">/</span>'+
                    '<span class="date_year">2015</span>',
                    valueISO: '2015-12-31'
                },
            ].map(function(data){
                it("sets and get "+data.value+" in div",function(){
                    if(skip) return;
                    theElement.setTypedValue(data.value);
                    if(def.html){
                        expect(theElement.innerHTML).to.be(data.htmlDisplay);
                    }
                    if(def.show){
                        if(def.type==='date' && data.value!=null){
                            expect(theElement.value).to.eql(data.valueISO);
                        }else{
                            expect(coalesce(theElement.value, theElement.textContent)).to.eql(data.display);
                        }
                    }
                    expect(theElement.getTypedValue()).to.eql(data.value);
                });
            });
           [
                {value:true},
                {value:'sarasa'},
                {value:0},
                {value:32},
                {value:{}},
                {value:[]},
                {value:/regexp/},
            ].forEach(function(def){
                it("reject invalid value "+def.value,function(){
                    if(skip) return;
                    var UNTOUCH = new Date(2001,12-1,20);
                    theElement.setTypedValue(UNTOUCH);
                    expect(function(){
                        theElement.setTypedValue(def.value);
                    }).to.throwError(/Not a date in input/);
                    expect(theElement.getTypedValue()).to.eql(UNTOUCH);
                });
            });
        });
    });
});