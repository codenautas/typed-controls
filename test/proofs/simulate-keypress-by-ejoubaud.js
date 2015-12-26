// obtenido y modificado según: https://gist.github.com/ejoubaud/7d7c57cda1c10a4fae8c#file-simulate_keypress-js

// Based on http://stackoverflow.com/a/10520017/1307721 and http://stackoverflow.com/a/16022728/1307721

Podium = {};

Podium.key = function(eventName, keyCode, input) {
    var oEvent = document.createEvent('KeyboardEvent');

    // Chromium Hack
    // /*
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
    // */
    
    if (oEvent.initKeyboardEvent) {
        oEvent.initKeyboardEvent(eventName, true, true, document.defaultView, keyCode, keyCode, "", "", false, "");
    } else {
        oEvent.initKeyEvent(eventName, true, true, document.defaultView, false, false, false, false, 0, keyCode);
    }
    
    // /*
    oEvent.keyCodeVal = keyCode;

    if (oEvent.keyCode !== keyCode) {
        alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
    }
    // */

    (input||document.body).dispatchEvent(oEvent);
}

function simulateKeypressByEjoubaud(){
    var newElement = document.createElement('input');
    var result;
    try{
        var charA = 65;
        newElement.focus();
        newElement.addEventListener('keypress',function(e){
            // document.body.innerHTML+='<br>keypress ';
            // document.body.innerHTML+=JSON.stringify(e);
            result = e.keyCode = charA;
        });
        Podium.key('keypress', charA, newElement);
        // document.body.innerHTML+='<br>value '+newElement.value+'<br>';
        return result
    }catch(err){
        return false;
    }
}
