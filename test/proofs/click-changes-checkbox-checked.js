function clickChangesCheckboxChecked(){
    var elem = document.createElement('input');
    elem.type = 'checkbox';
    elem.checked = false;
    elem.click();
    return !!elem.checked;
}