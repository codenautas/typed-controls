function supportNewKeyboardEvent(){
    var newElement = document.createElement('input');
    try{
        var charA = 65;
        e = new KeyboardEvent('keypress', {
            keyCode: charA,
            charCode: charA,
            which: charA,
            key: 'A',
            "char": 'A',
            code: charA,
            bubbles : true, 
            cancelable : true
        });
        newElement.focus();
        newElement.dispatchEvent(e);
        return newElement.value === 'A'
    }catch(err){
        return false;
    }
}
