"use strict";

var Tedede={};

var html=jsToHtml.html;
var coalesce = bestGlobals.coalesce;

Tedede.Form = function Form(formInfo, medium){
    this.info=formInfo;
    this.medium=medium;
}

Tedede.Form.prototype.render = function render(container){
    var formHtml=html.div({id: JSON.stringify(this.medium.superId)},
        this.info.fields.map(function(field){
            return html.div({id:'div_'+field.name},[
                html.label({"for":field.name},field.name), 
                html.input({id:field.name})
            ]);
        })
    );
    var div=formHtml.create();
    this.dom=div;
    if(!this.medium.forms){
        this.medium.forms=[];
    }
    this.medium.forms.push(this);
    container.appendChild(div);
    return Promise.resolve();
}

Tedede.createForm = function createForm(formInfo, data){
    var form = new this.Form(formInfo, data);
    return form;
}

Tedede.adaptElement = function adaptElement(domElement, type){
    var dataAttr=domElement.tagName==='INPUT'?'value':'textContent';
    domElement.validateTypedData = function setTypedValue(typedValue){
        if(typedValue===''){
            throw new Error('text cannot be empty');
        }
    };
    domElement.setTypedValue = function setTypedValue(typedValue){
        this.validateTypedData(typedValue);
        this[dataAttr] = typedValue;
    };
    domElement.getTypedValue = function setTypedValue(){
        return this[dataAttr]===''?null:this[dataAttr];
    };
}

Tedede.connect = function connect(opts){
    opts.input.value = opts.almacen[opts.field];
}
