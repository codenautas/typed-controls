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

var BestTypes = {};

BestTypes["text"] = {
    adapters:{
        validateTypedData: function validateTypedDataNoObjectAccepted(typedValue){
            if(typedValue!==null && typedValue instanceof Object){
                throw new Error("Invalid object value in Tedede.adaptElement");
            }
        },
        getTypedValue: function getTypedValueText(){
            return this.getPlainValue();
        },
        setValidatedTypedValue: function setValidatedTypedValueText(typedValue){
            this.setPlainValue(typedValue);
        },
    }
};

BestTypes["text_no_empty"] = {
    adapters:{
        validateTypedData: function validateTypedDataTextNoEmpty(typedValue){
            if(typedValue===''){
                throw new Error('text cannot be empty');
            }
        },
        getTypedValue: BestTypes["text"].adapters.getTypedValue,
        setValidatedTypedValue: BestTypes["text"].adapters.setValidatedTypedValue,
    }
};

BestTypes["number"] = {
    adapters:{
        validateTypedData: function validateTypedDataNumber(typedValue){
            if(isNaN(typedValue)){
                throw new Error('Not a Number in input');
            }
        },
        getTypedValue: function getTypedValueNumber(){
            var value = this.getPlainValue();
            if(value===null){
                return null;
            }else{
                value = Number(value);
            }
            return value;
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyNumber(typedValue){
            if(typedValue==null){
                this.setPlainValue(typedValue);
            }else if('value' in this){
                this.value = typedValue.toString();
            }else{
                var str = typedValue.toString();
                var formated = str.replace(/^([-+]?[0-9 ]*)((\.)([0-9 ]*))?$/, function(str, left, dotPart, dot, right){
                    var rta = [];
                    left.replace(/^([-+]?[0-9]?[0-9]?)(([0-9][0-9][0-9])*)$/, function(str, prefix, triplets){
                        rta.push(html.span({"class": "number_miles"}, prefix));
                        triplets.replace(/[0-9][0-9][0-9]/,function(triplet){
                            rta.push(html.span({"class": "number_miles"}, triplet));
                        });
                    });
                    if(dot){
                        rta.push(html.span({"class": "number_dot"},dot));
                    }
                    if(right){
                        rta.push(html.span({"class": "number_decimals"},right));
                    }
                    return rta.map(function(x){ return x.toHtmlText(); }).join('');
                });
                this.innerHTML = formated;
            }
        },
    }
};

BestTypes["boolean"] = {
    adapters:{
        validateTypedData: function validateTypedDataNumber(typedValue){
            if(typedValue!==false && typedValue!==true && typedValue!=null){
                throw new Error('Not a boolean in input');
            }
        },
        getTypedValue: function getTypedValueNumber(){
            var value = this.getPlainValue();
            if(value===null){
                return null;
            }else if('checked' in this){
                return this.checked;
            }else{
                return value[0]!=='n';
            }
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyNumber(typedValue){
            if('checked' in this){
                this.checked = typedValue;
            }else{
                var plainValue = typedValue==null?(typedValue?'Sí':'no'):'';
                this.setPlainValue(plainValue);
                if(this.tagName!=='INPUT'){
                    this.innerHTML = formated;
                }
            }
        },
    }
};

Tedede.adaptElement = function adaptElement(domElement, typeName){
    var dataAttr=domElement.tagName==='INPUT'?'value':'textContent';
    domElement.getPlainValue = function getPlainValue(plainValue){
        return this[dataAttr]===''?null:this[dataAttr];
    }
    domElement.setPlainValue = function setPlainValue(plainValue){
        this[dataAttr] = plainValue;
    }
    domElement.setTypedValue = function setTypedValue(typedValue){
        this.validateTypedData(typedValue);
        this.setValidatedTypedValue(typedValue);
    }
    for(var attr in BestTypes[typeName].adapters){
        domElement[attr] = BestTypes[typeName].adapters[attr];
    }
}

Tedede.connect = function connect(opts){
    opts.input.value = opts.almacen[opts.field];
}
