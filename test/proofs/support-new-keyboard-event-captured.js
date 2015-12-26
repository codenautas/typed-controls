function supportNewKeyboardEventCaptured(){
    var newElement = document.createElement('input');
    document.body.appendChild(newElement);
    try{
        var result;
        var keyCode = 65;
        var eventName = 'keypress'
        e = new KeyboardEvent(eventName, {
            key: 'A',
            code: 'KeyA',
            keyCode: keyCode,
            charCode: keyCode,
            which: keyCode
        });
        if (e.initKeyboardEvent) {
            e.initKeyboardEvent(eventName, true, true, document.defaultView, keyCode, keyCode, "", "", false, "");
        } else {
            e.initKeyEvent(eventName, true, true, document.defaultView, false, false, false, false, 0, keyCode);
        }
        newElement.addEventListener('keypress', function(event){
            result = event.keyCode === keyCode;
        });
        newElement.dispatchEvent(e);
        document.body.removeChild(newElement);
        return result;
    }catch(err){
        return false;
    }
}
