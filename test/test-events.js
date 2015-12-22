"use strict";

if(! /Safari|PhantomJS/.test(window.navigator.userAgent)) {
    describe("events", function(){
        function sendClickTo(elem) {
                // var e = new MouseEvent('click', { 'view': window, 'bubbles': true, 'cancelable': true });
                var e = document.createEvent("MouseEvent");
                e.initMouseEvent( "click",
                                 true /* bubble */, true /* cancelable */,
                                 window, null, 0, 0, 0, 0, /* coordinates */
                                 false, false, false, false, /* modifier keys */
                                 0 /*left*/, null )
                // var e = document.createEvent('MouseEvents');
                // e.initEvent( 'click', true, true );
                elem.dispatchEvent(e);
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
    });
}