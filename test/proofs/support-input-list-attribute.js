function supportInputListAttribute() {
    try {
        var elemento = document.createElement('input');
        elemento.list='id-list'; // da error
        document.write("elemento.list ["+elemento-list+"]")
        return true;
    }
    catch(err) { return false; }
}
