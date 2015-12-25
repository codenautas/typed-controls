function supportInputTypeDate(){
    var newElement = document.createElement('input');
    try{
        newElement.type='date';
        return newElement.type==='date';
    }catch(err){
        return false;
    }
}
