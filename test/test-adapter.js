"use script";

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
        });
        it("reject empty value",function(){
            divElement.setTypedValue('untouched');
            expect(function(){
                divElement.setTypedValue('');
            }).to.throwError(/text cannot be empty/);
            expect(divElement.getTypedValue()).to.be('untouched');
        });
    });
    describe("for number type",function(){
        [
            {tagName:'div', type:''}, 
            {tagName:'input', type:'text'}, 
            {tagName:'input', type:'number'}
        ].forEach(function(def){
            var theElement;
            beforeEach(function(done){
                theElement = html[def.tagName]({type:def.type}).create();
                Tedede.adaptElement(theElement,'number');
                done();
            });
            it("sets and get normal string in div",function(){
                theElement.setTypedValue(42);
                expect(theElement.textContent||theElement.value).to.be('42');
                expect(theElement.getTypedValue()).to.be(42);
            });
            it("set and gets null in div",function(){
                theElement.setTypedValue(null);
                expect(coalesce(theElement.textContent,theElement.value)).to.be('');
                expect(theElement.getTypedValue()).to.be(null);
            });
            it("set and gets 0 in div",function(){
                theElement.setTypedValue(0);
                expect(theElement.textContent||theElement.value).to.be('0');
                expect(theElement.getTypedValue()).to.be(0);
            });
            it("reject invalid value",function(){
                var UNTOUCH = Math.random();
                theElement.setTypedValue(UNTOUCH);
                expect(function(){
                    theElement.setTypedValue('sarasa');
                }).to.throwError(/Not a Number in input/);
                expect(theElement.getTypedValue()).to.be(UNTOUCH);
            });
            it("set pretty value",function(){
                var x = '12345.125';
                theElement.setTypedValue(x);
                expect(theElement.textContent||theElement.value).to.be(x);
                if(theElement.value){
                    expect(theElement.value).to.be(x);
                }else if(theElement.textContent){
                    expect(theElement.textContent).to.be(x);
                    expect(theElement.innerHTML).to.be(
                        '<span class="number_miles">12</span>'+
                        '<span class="number_miles">345</span>'+
                        '<span class="number_dot">.</span>'+
                        '<span class="number_decimals">125</span>'
                    );
                }else{
                    expect('No value in textContent or value').to.be.false();
                }
                expect(theElement.getTypedValue()).to.be(Number(x));
            });
        });
    });
});