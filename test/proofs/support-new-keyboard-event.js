function supportNewKeyboardEvent(){
    var newElement = document.createElement('input');
    try{
        var charA = 65;
        e = new KeyboardEvent('keypress', {
            key: 'A',
            code: 'KeyA',
        });
        newElement.focus();
        newElement.dispatchEvent(e);
        return newElement.value === 'A'
    }catch(err){
        return false;
    }
}
