"use strict";

function showEvent(eventName){
    document.body.addEventListener(eventName, function(e){
        var ae=document.activeElement;
        messages.textContent+='\n'+e.type+' '+e.which+' '+e.keyCode+' '+e.altKey+' ---> '+(ae.id||ae.tagName);
        console.log(e.type+' '+e.which+' '+e.keyCode+' '+e.altKey+' ---> '+(ae.id||ae.tagName));
    },true);
}

window.addEventListener('load', function(){
    TypedControls.adaptElement(bool1, 'boolean');
    TypedControls.adaptElement(text1, 'text');
    TypedControls.adaptElement(number1, 'number');
    TypedControls.adaptElement(number2, 'number');
    TypedControls.adaptElement(text1, 'text');
    TypedControls.adaptElement(bool2, 'boolean');
    TypedControls.adaptElement(txtEmiter, 'text');
    TypedControls.adaptElement(textDiv, 'text');
    if(!"show events"){
        showEvent('keydown');
        showEvent('keypress');
        showEvent('keyup');
    }
});
