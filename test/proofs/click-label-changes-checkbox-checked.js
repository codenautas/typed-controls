function clickLabelChangesCheckboxChecked(){
    var elem = document.createElement('input');
    elem.type = 'checkbox';
    elem.id = 'the-checkbox';
    document.body.appendChild(elem);
    var label = document.createElement('label')
    label.htmlFor = elem.id;
    document.body.appendChild(label);
    elem.checked = false;
    try{
        label.click();
    }catch(err){
        return false;
    }
    var result = !!elem.checked;
    document.body.removeChild(elem);
    return result;
}