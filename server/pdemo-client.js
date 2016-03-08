"use strict";

function showEvent(eventName){
    document.body.addEventListener(eventName, function(e){
        var ae=document.activeElement;
        messages.textContent+='\n'+e.type+' '+e.which+' '+e.keyCode+' '+e.altKey+' ---> '+(ae.id||ae.tagName);
        console.log(e.type+' '+e.which+' '+e.keyCode+' '+e.altKey+' ---> '+(ae.id||ae.tagName));
    },true);
}

window.addEventListener('load', function(){
    //console.log("ABP", JSON.stringify(AjaxBestPromise));
    //console.log("Tedede", JSON.stringify(Tedede));
    Tedede.adaptElement(bool1, 'boolean');
    Tedede.adaptElement(text1, 'text');
    Tedede.adaptElement(bool2, 'boolean');
    
    Tedede.adaptElement(txtEmiter, 'text');
    if(!"show events"){
        showEvent('keydown');
        showEvent('keypress');
        showEvent('keyup');
    }
});
