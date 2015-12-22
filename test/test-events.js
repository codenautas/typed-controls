"use strict";

describe.skip("events", function(){
    function sendClickTo(elem) {
        if(/Firefox|Chrome/.test(window.navigator.userAgent)) {
            var e = document.createEvent("MouseEvent");
            e.initMouseEvent( "click",
                             true /* bubble */, true /* cancelable */,
                             window, null, 0, 0, 0, 0, /* coordinates */
                             false, false, false, false, /* modifier keys */
                             0 /*left*/, null )
            elem.dispatchEvent(e);
        } else {
            elem.click();
        }
    }
    it("must receive click and change the internal typed value", function(done){
        var theElement = html.input({type:"checkbox"}).create();
        Tedede.adaptElement(theElement,'boolean');
        theElement.setTypedValue(null);
        expect(theElement.getTypedValue()).to.be(null);
        sendClickTo(theElement);
        expect(theElement.getTypedValue()).to.be(true);
        sendClickTo(theElement);
        expect(theElement.getTypedValue()).to.be(false);
        sendClickTo(theElement);
        expect(theElement.getTypedValue()).to.be(true);
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
    
    it("must receive click and change the internal typed value", function(done){
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
