function supportInputTypeUnsoportable(){
    var newElement = document.createElement('input');
    try{
        newElement.type='unsoportable';
        return newElement && newElement.type==='unsoportable';
    }catch(err){
        return false;
    }
}
