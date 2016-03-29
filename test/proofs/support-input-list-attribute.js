function supportInputListAttribute() {
    try {
        var elemento = document.createElement('input');
        elemento.type='text';
        var datalist = document.createElement('datalist');
        datalist.id = "lista";
        //elemento.list='lista'; // da error
        elemento.setAttribute('list','lista'); // ok 
        var marcasAuto = ['Ford','Wolkswagen','Fiat'];
        for(var marca in marcasAuto) {
            var option = document.createElement('option');
            option.label = marcasAuto[marca];
            option.value = marcasAuto[marca];
            datalist.appendChild(option);
        }
        if(false) {
            document.body.appendChild(elemento);
            document.body.appendChild(datalist);
        }
        return true;
    }
    catch(err) {
        document.write("error:"+err+"<br>\n")
        return false;
    }
}
