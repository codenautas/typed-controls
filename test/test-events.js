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
            elem.dispatchEvent(e);
        }catch(err){
            NOT_SUPPORTED_SITUATION({
                must: !err,
                description: 'error in creating MouseEvent: '+err,
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
    function sendKeyTo(elem, keyCode, eventName) {
        // based in https://gist.github.com/ejoubaud/7d7c57cda1c10a4fae8c#file-simulate_keypress-js
        eventName = eventName || 'keypress';
        var oEvent = document.createEvent('KeyboardEvent');
        try{
            Object.defineProperty(oEvent, 'keyCode', {
                get : function() {
                    return this.keyCodeVal;
                }
            });     
            Object.defineProperty(oEvent, 'which', {
                get : function() {
                    return this.keyCodeVal;
                }
            });
            if (oEvent.initKeyboardEvent) {
                oEvent.initKeyboardEvent(eventName, true, true, document.defaultView, keyCode, keyCode, "", "", false, "");
            } else {
                oEvent.initKeyEvent(eventName, true, true, document.defaultView, false, false, false, false, 0, keyCode);
            }
            oEvent.keyCodeVal = keyCode;
        }catch(err){
            NOT_SUPPORTED_SITUATION({
                must: !err,
                description: "setting keyCode and which when emulating event",
                excluding: ['Safari 5.1.7', 'PhantomJS 1.9.8'],
                context: err
            });
            oEvent = document.createEvent('Events');
            oEvent.initEvent(eventName, true, true);
            oEvent.keyCode = keyCode;
            oEvent.which = keyCode;
        }
        if (oEvent.keyCode !== keyCode) {
            throw new Error("INTERNAL keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
        }
        elem.dispatchEvent(oEvent);
    }
    it("must receive del or backspace key and change the internal typed value to null", function(done){
        var theElement = html.input({type:"checkbox"}).create();
        Tedede.adaptElement(theElement,'boolean');
        document.body.appendChild(theElement);
        theElement.setTypedValue(true);
        sendKeyTo(theElement, 8 , 'keydown');
        expect(theElement.getTypedValue()).to.be(null);
        theElement.setTypedValue(false);
        sendKeyTo(theElement, 46, 'keydown');
        expect(theElement.getTypedValue()).to.be(null);
        done();
    });
});
 