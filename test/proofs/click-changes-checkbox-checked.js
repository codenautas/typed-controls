function clickChangesCheckboxChecked(){
    var elem = document.createElement('input');
    elem.type = 'checkbox';
    document.body.appendChild(elem);
    elem.checked = false;
    elem.click();
    var result = !!elem.checked;
    document.body.removeChild(elem);
    return result;
}