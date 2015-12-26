"use strict";

describe("events", function(){
    function sendClickTo(elem) {
        var e;
        try{
            e = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
        }catch(err){
            NOT_SUPPORTED_SITUATION({
                must: !err,
                description: 'error in creating MouseEvent: '+err,
                excluding: 'IE 11.0, PhantomJS 1.9.8, Safari 5.1.7'.split(', ')
            });
        }
        try{
            if(!e){
                e = document.createEvent('click');
            }
        }catch(err){
            NOT_SUPPORTED_SITUATION({
                must: !err,
                description: 'error in creating MouseEvent: '+err,
                excluding: 'IE 11.0, PhantomJS 1.9.8, Safari 5.1.7'.split(', ')
            });
            /*
            if(agentInfo.brief==='IE 11.0'){
                elem.fireEvent('click');
            }else{
                elem.click();
            }
            */
        }
        if(e){
            elem.dispatchEvent(e);
        }else{
            NOT_SUPPORTED_SITUATION({
                must: !!e,
                description: 'no event created',
                excluding: 'IE 11.0, PhantomJS 1.9.8, Safari 5.1.7'.split(', ')
            });
            elem.click();
        }
    }
    it("must receive click and change the internal typed value of null to a boolean value", function(done){
        var id = 'id' + Math.random();
        var theElement = html.input({type:"checkbox", id:id}).create();
        Tedede.adaptElement(theElement,'boolean');
        var theLabel = html.label({"for": id}, "the text for this tri-state checkbox").create();
        document.body.appendChild(theElement);
        document.body.appendChild(theLabel);
        theElement.setTypedValue(null); 
        expect(theElement.indeterminate).to.be(true); 
        expect(theElement.getTypedValue()).to.be(null); 
        sendClickTo(theElement);
        expect(theElement.indeterminate).to.be(false); 
        var firstValue=theElement.getTypedValue();
        expect(firstValue===true || firstValue==false).to.ok();
        sendClickTo(theElement);
        expect(theElement.getTypedValue()).to.be(!firstValue);
        var elementToClick;
        if(NOT_SUPPORTED_SITUATION({
            must: 'click' in theLabel && typeof theLabel.click === 'function',
            description: "could'nt emulate label click'",
            excluding: ['Safari 5.1.7', 'PhantomJS 1.9.8']
        })){
            elementToClick = theElement;
        }else{
            elementToClick = theLabel;
        }
        sendClickTo(elementToClick);
        expect(theElement.getTypedValue()).to.be(!!firstValue);
        sendClickTo(elementToClick);
        expect(theElement.getTypedValue()).to.be(!!!firstValue);
        done();
    });
    function sendSpaceTo(elem) {
        try {
            var keyboardEvent = document.createEvent("KeyboardEvent");
            var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
            keyboardEvent[initMethod](
                       "keypress", // event type : keydown, keyup, keypress
                        true, // bubbles
                        true, // cancelable
                        window, // viewArg: should be window
                        false, // ctrlKeyArg
                        false, // altKeyArg
                        false, // shiftKeyArg
                        false, // metaKeyArg
                        0, // keyCodeArg : unsigned long the virtual key code, else 0
                        " ".charCodeAt(0) // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
            );
            elem.dispatchEvent(keyboardEvent);            
        } catch (e) {
            console.log("sendSpaceTo() error: ", e)
        }
    }
    
    it.skip("must receive click and change the internal typed value", function(done){
        var theElement = html.input({type:"checkbox", name:'cajita'}).create();
        Tedede.adaptElement(theElement,'boolean');
        theElement.focus = function() { console.log("foco en ", this.name); }
        theElement.change = function() { console.log("change en ", this.name); }
        theElement.setTypedValue(null);
        theElement.focus();
        expect(theElement.getTypedValue()).to.be(null);
        sendSpaceTo(theElement);
        expect(theElement.getTypedValue()).to.be(true);
        sendSpaceTo(theElement);
        expect(theElement.getTypedValue()).to.be(false);
        sendSpaceTo(theElement);
        expect(theElement.getTypedValue()).to.be(true);
        done();
    });
});
 