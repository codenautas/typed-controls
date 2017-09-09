"use strict";

function showEvent(eventName){
    document.body.addEventListener(eventName, function(e){
        var ae=document.activeElement;
        messages.textContent+='\n'+e.type+' '+e.which+' '+e.keyCode+' '+e.altKey+' ---> '+(ae.id||ae.tagName);
        console.log(e.type+' '+e.which+' '+e.keyCode+' '+e.altKey+' ---> '+(ae.id||ae.tagName));
    },true);
}

window.addEventListener('load', function(){
    if(!'checkbox-based-controls-not-ready'){
        TypedControls.adaptElement(bool1    , {typeName:'boolean'});
    }
    TypedControls.adaptElement(text1    , {typeName:'text'   });
    TypedControls.adaptElement(number1  , {typeName:'integer'});
    TypedControls.adaptElement(number2  , {typeName:'integer'});
    TypedControls.adaptElement(text1    , {typeName:'text'   });
    if(!'options-based-controls-not-ready'){
        TypedControls.adaptElement(bool2    , {typeName:'boolean'});
    }
    TypedControls.adaptElement(txtEmiter, {typeName:'text'   });
    TypedControls.adaptElement(textDiv  , {typeName:'text'   });
    if(!"show events"){
        showEvent('keydown');
        showEvent('keypress');
        showEvent('keyup');
    }
});
