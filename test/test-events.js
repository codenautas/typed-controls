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
                excluding: 'IE 11.0, PhantomJS 1.9.8, PhantomJS 2.1.1, Safari 5.1.7'.split(', ')
            });
            elem.click();
        }
    }
    it.skip("must receive click and change the internal typed value of null to a boolean value", function(){
        var id = 'id' + Math.random();
        var theElement = html.input({type:"checkbox", id:id}).create();
        TypedControls.adaptElement(theElement,'boolean');
        var theLabel = html.label({"for": id}, "the text for this tri-state checkbox").create();
        document.body.appendChild(theElement);
        document.body.appendChild(theLabel);
        theElement.setTypedValue(null); 
        expect(theElement.indeterminate).to.be(true); 
        expect(theElement.getTypedValue()).to.be(null); 
        sendClickTo(theElement);
        expect(theElement.indeterminate).to.be(false); 
        expect(document.activeElement).to.be(theElement);
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
        // done();
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
                excluding: ['Safari 5.1.7', 'PhantomJS 1.9.8', 'PhantomJS 2.1.1'],
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
    it.skip("must receive del or backspace key and change the internal typed value to null", function(done){
        var theElement = html.input({type:"checkbox"}).create();
        TypedControls.adaptElement(theElement,'boolean');
        document.body.appendChild(theElement);
        theElement.setTypedValue(true);
        sendKeyTo(theElement, 8 , 'keydown'); // backspace
        expect(theElement.getTypedValue()).to.be(null);
        theElement.setTypedValue(false);
        sendKeyTo(theElement, 46, 'keydown'); // delete
        expect(theElement.getTypedValue()).to.be(null);
        done();
    });
    it.skip("must receive space key and change the internal typed value to null", function(done){
        var theElement = html.input({}).create();
        TypedControls.adaptElement(theElement,'text');
        document.body.appendChild(theElement);
        sendKeyTo(theElement, 32 , 'keypress'); // ' '
        expect(theElement.getTypedValue()).to.be('');
        expect(theElement.valueEmpty).to.be(true);
        expect(theElement.value).to.be('');
        sendKeyTo(theElement, 32 , 'keypress');
        expect(theElement.valueEmpty).to.be(false);
        done();
    });
    [
        {tagName:'div'  },
        {tagName:'input', type:'text' }, 
        {tagName:'input', type:'date' }
    ].forEach(function(def){
        it.skip("must receieve key 'h' and change the internal typed value to current date", function(done){
            var theElement;
            var theElementErr=null;
            try{
                var params=[];
                if(def.type!==undefined){
                    params.push({type:def.type});
                }
                theElement = html[def.tagName].apply(html, params).create();
                TypedControls.adaptElement(theElement,'date');
            }catch(err){
                theElement = null;
                theElementErr = err;
            }
            var skip = NOT_SUPPORTED_SITUATION({
                when: def.type === 'date',
                must: theElement && theElement.type==='date',
                description: 'input of type date 2',
                excluding: 'IE 11.0, PhantomJS 2.1.1, Firefox 31.0, Firefox 39.0, Firefox 43.0, Firefox 44.0, Firefox 45.0, Firefox 47.0, Firefox 49.0, Firefox 50.0, Firefox 52.0, Firefox 53.0, Firefox 54.0'.split(', '),
                context: theElementErr
            });
            if(! skip) {
                // console.log("-----------", def.tagName, def.type, agentInfo.brief);
                document.body.appendChild(theElement);
                expect(theElement.getTypedValue()).to.be(null);
                theElement.focus();
                sendKeyTo(theElement, 39, 'keydown'); // right
                expect(theElement.getTypedValue()).to.be(null);
                sendKeyTo(theElement, 72, 'keydown'); // h
                var obtD = theElement.getTypedValue(), expD=new Date(Date.now());
                expect(obtD.getFullYear()).to.eql(expD.getFullYear());
                expect(obtD.getMonth()).to.eql(expD.getMonth());
                expect(obtD.getDate()).to.eql(expD.getDate());
                expect(obtD.getHours()).to.eql(0);
                expect(obtD.getMinutes()).to.eql(0);
                expect(obtD.getSeconds()).to.eql(0);
            }
            done();
        });
    });
});
 