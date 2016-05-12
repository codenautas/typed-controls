"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'Tedede', function() {
/*jshint +W040 */

/*jshint -W004 */
var Tedede = {};
/*jshint +W004 */

var html=jsToHtml.html;
var coalesce = bestGlobals.coalesce;
var changing = bestGlobals.changing;

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
};

;(function () {
    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }
    if(typeof(window.CustomEvent)!=='function'){
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }
})();

var BestTypes = {};

var iiiiiiid=1;

Tedede.optionsCtrl = function optionsCtrl(typeInfo){
    var options = typeInfo.options;
    return html.div({"tedede-option-group": 'simple-option'},
        options.map(function(option){
           // console.log(typeInfo.options, option.salto)
            return html.div([
                (typeInfo.showOption?html.label({"for-value": option.option},option.option):null), 
                html.input({type:'radio', value:option.option}), 
                html.label({"for-value": option.option},option.label), 
                (option.more?html.span({"for-value": option.option, "class":"option-more-info"}):null)
            ]);
        })
    );
}

Tedede.booleanCtrl = function booleanCtrl(){
    return Tedede.optionsCtrl({options: BestTypes["boolean"].defaultOptions});
}

BestTypes["text"] = {
    translates:{true:{
        '\n': '\u21b5'
    },false:{}},
    translatesRegExp:{},
    translatesRev:{},
    translate: function(right, textValue){
        return textValue.replace(new RegExp(BestTypes["text"].translatesRegExp[right],'g'),function(chartt){
            return BestTypes["text"].translates[right][chartt];
        });
    },
    adapters:{
        validateTypedData: function validateTypedDataNoObjectAccepted(typedValue){
            if(typedValue!==null && typeof typedValue !== 'string'){
                throw new Error("Not a text in input");
            }
        },
        getTypedValue: function getTypedValueText(){
            var typedValue = this.getPlainValue();
            if(this.tagName==='INPUT' && typedValue!==null){
                typedValue = BestTypes["text"].translate(false, typedValue);
            }
            if(typedValue==null && this.valueEmpty){
                return '';
            }else{
                return typedValue;
            }
        },
        setValidatedTypedValue: function setValidatedTypedValueText(typedValue){
            if(this.tagName==='INPUT' && typedValue!=null){
                typedValue = BestTypes["text"].translate(true, typedValue);
            }
            if(this.tagName==='TEXTAREA' && typedValue==null){
                this.setPlainValue('');
            }else{
                this.setPlainValue(typedValue);
            }
            this.valueEmpty = typedValue==='';
        },
    },
    listeners:{
        'keypress': function onKeyPressListenerForText(event){
            if(this.value===''){
                if(event.keyCode == 32){
                    if(!this.valueEmpty){
                        this.valueEmpty = true;
                        event.preventDefault();
                    }else{
                        this.valueEmpty = false;
                    }
                }
            }else{
                this.valueEmpty = false;
            }
        },
        'blur': function onBlurListenerForText(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}, mainUpdateEventName:'blur'},
        {tagName:'div'     , attributes:{}           },
        {tagName:'textarea', attributes:{}},
    ]
};

for(var charToTranslate in BestTypes["text"].translates[true]){
    BestTypes["text"].translates[false][BestTypes["text"].translates[true][charToTranslate]] = charToTranslate;
}

for(var groups in BestTypes["text"].translates){
    BestTypes["text"].translatesRegExp[groups] = '['+Object.keys(BestTypes["text"].translates[groups])+']';
}

BestTypes["text_no_empty"] = {
    adapters:{
        validateTypedData: function validateTypedDataTextNoEmpty(typedValue){
            BestTypes["text"].adapters.validateTypedData(typedValue);
            if(typedValue===''){
                throw new Error('text cannot be empty');
            }
        },
        getTypedValue: function getTypedValueText(){
            return this.getPlainValue();
        },
        setValidatedTypedValue: function setValidatedTypedValueTextNoEmpty(typedValue){
            if(this.tagName==='TEXTAREA' && typedValue==null){
                this.setPlainValue('');
            }else{
                this.setPlainValue(typedValue);
            }
        },
    },
    listeners:{
        'blur': function onBlurListenerForTextNoEmpty(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:BestTypes["text"].domFixtures.concat({tagName:'input', attributes:{type:'password'}})
};

BestTypes["number"] = {
    adapters:{
        validateTypedData: function validateTypedDataNumber(typedValue){
            if(typedValue!=null && typeof typedValue !== "number"){                
                throw new Error('Not a Number in input is '+typeof typedValue);
            }
            if('minValue' in this.tededeTypeInfo && typedValue<this.tededeTypeInfo.minValue){
                throw new Error('The value is lower than '+this.tededeTypeInfo.minValue);
            }
            if('maxValue' in this.tededeTypeInfo && typedValue>this.tededeTypeInfo.maxValue){
                throw new Error('The value is greater than '+this.tededeTypeInfo.maxValue);
            }
            if(this.tededeTypeInfo.onlyInt && typedValue%1!=0){
                throw new Error('The value is not an integer');
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
    },
    listeners:{
        'blur': function onBlurListenerForTextNoEmpty(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'input'   , attributes:{type:'number'}},
        {tagName:'div'     , attributes:{}},
    ]
};

BestTypes["boolean"] = {
    adapters:{
        validateTypedData: function validateTypedDataBoolean(typedValue){
            if(typedValue!==false && typedValue!==true && typedValue!=null){
                throw new Error('Not a boolean in input');
            }
        },
        getTypedValue: function getTypedValueBoolean(){
            var tededeOptionGroup=this.getAttribute("tedede-option-group");
            if(tededeOptionGroup){
                var typedValue = null;
                [true, false].forEach(function(value){
                    if(document.getElementById(tededeOptionGroup+'-'+value).checked){
                        typedValue = value;
                    }
                });
                return typedValue;
            }else if(this.type==='checkbox'){
                return this.indeterminate?null:this.checked;
            }else{
                var value = this.getPlainValue();
                if(value==null){
                    return null;
                }else{
                    return value[0]!=='n';
                }
            }
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyBoolean(typedValue){
            var tededeOptionGroup=this.getAttribute("tedede-option-group");
            if(tededeOptionGroup){
                [true, false].forEach(function(value){
                    document.getElementById(tededeOptionGroup+'-'+value).checked = value===typedValue;
                });
            }else if(this.type==='checkbox'){
                this.checked = typedValue;
                this.indeterminate = typedValue==null;
            }else{
                var plainValue = typedValue==null?'':(typedValue?'Sí':'no');
                this.setPlainValue(plainValue);
                if(this.tagName!=='INPUT'){
                    if(typedValue!==null){
                        this.innerHTML = html.span({"class": "bool_"+JSON.stringify(typedValue)}, plainValue).toHtmlText();
                    }
                }
            }
        },
    },
    listeners:{
        'keydown': function onKeyDownListenerForBoolean(event){
            if(this.type==='checkbox' && (
                event.keyCode == 8 //backspace
                || event.keyCode == 46 //delete/Supr
                || event.keyCode == 109 //'-'/minus in keypad
                || event.keyCode == 189 //'-'/minus in keyboard
                || event.keyCode == 190 //'.'/period in keyboard
            )){
                this.checked = false;
                this.indeterminate = true;
                event.preventDefault();
            }
        },
        'click': function onClickListenerForBoolean(event){
            if(this.type==='checkbox'){
                if(document.activeElement!==this){
                    // Safari 5.1.7 and other old browsers doesn't set activeElement
                    this.focus();
                }
            }
        },
        'blur': function onBlurListenerForBoolean(event) {
            this.dispatchEvent(new CustomEvent('update'));
        },
        'change': function onChangeListenerForBoolean(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:[
        {creatorFunction:Tedede.booleanCtrl, attributes:{}},
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}, mainUpdateEventName:'blur'},
        {tagName:'input'   , attributes:{type:'checkbox'}, mainUpdateEventName:'change'},
    ],
    defaultOptions:[
        {option: true , label:'Sí'}, 
        {option: false, label:'No'},
    ]
};

BestTypes["date"] = {
    adapters:{
        validateTypedData: function validateTypedDataDate(typedValue){
            if(typedValue!=null){
                if(!(typedValue instanceof Date)){
                    throw new Error('Not a date in input');
                // }else if(!(/[0 ]0:00:00/.test(typedValue.toLocaleString("local", {hour12:false})))){
                }else if(typedValue.getTime() != new Date(typedValue.getFullYear(), typedValue.getMonth(), typedValue.getDate()).getTime()){
                    throw new Error('date must be an absolute date without time '+typedValue+' <> '+new Date(typedValue.getFullYear(), typedValue.getMonth(), typedValue.getDate()));
                }
            }
        },
        getTypedValue: function getTypedValueDate(){
            var plainValue = this.getPlainValue();
            if(plainValue==null){
                return null;
            }else if (this.type==='date') {
                var parts = plainValue.split(/[-\/]/);
                var value= new Date(parts[0],parts[1]-1,parts[2]);
            }else{
                var parts = plainValue.split(/[-\/]/);
                return new Date(parts[2],parts[1]-1,parts[0]);
            }
            return value;
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyDate(typedValue){
             if(typedValue==null){
                this.setPlainValue(typedValue);
            }else if(this.type==='date'){
                this.value = typedValue.toISOString().substr(0,10);
            }else{
                var month = typedValue.getUTCMonth()+1; 
                var day = typedValue.getUTCDate();
                var year = typedValue.getUTCFullYear();
                this.setPlainValue(day+'/'+month+'/'+year);
                if(this.tagName!=='INPUT'){
                    var rta=[];
                    rta.push(html.span({"class":"date_day"},day));
                    rta.push(html.span({"class":"date_sep"},'/'));
                    rta.push(html.span({"class":"date_month"},month));
                    rta.push(html.span({"class":"date_sep"},'/'));
                    rta.push(html.span({"class":"date_year"},year));
                    rta = rta.map(function(x){ return x.toHtmlText(); }).join('');
                   // console.log("QUE ES ESO     =  " + JSON.stringify(rta));
                    this.innerHTML = rta;
                }
            }
            
        },
    },
    listeners:{
        'blur': function onBlurListenerForTextNoEmpty(event) {
            this.dispatchEvent(new CustomEvent('update'));
        },
        'keydown': function onKeyDownListenerForDate(event){
            if(event.keyCode == 72) { // key h
                var now=new Date();
                this.setTypedValue(new Date(now.getFullYear(),now.getMonth(),now.getDate()));
                event.preventDefault();
            } 
        },
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'date'}},
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}},
    ]
};

BestTypes["enum"] = {
    adapters:{
        validateTypedData: function validateTypedDataBoolean(typedValue){
            if(typedValue!=null && !this.tededeValidOptions[typedValue]){
                throw new Error('Not a enum in input');
            }
        },
        getTypedValue: function getTypedValueEnum(){
            var tededeOptionGroup=this.getAttribute("tedede-option-group");
            //if(tededeOptionGroup)
            {
                var typedValue = null;
                this.tededeTypeInfo.options.forEach(function(option){
                    if(document.getElementById(tededeOptionGroup+'-'+option.option).checked){
                        typedValue = option.option;
                    }
                });
                return typedValue;
            }
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyBoolean(typedValue){
            var tededeOptionGroup=this.getAttribute("tedede-option-group");
            //if(tededeOptionGroup)
            { 
                this.tededeTypeInfo.options.forEach(function(option){
                    document.getElementById(tededeOptionGroup+'-'+option.option).checked = option.option===typedValue;
                });
            }
        },
    },
    listeners:{
        /* TODO:
        'keydown': function onKeyDownListenerForBoolean(event){
        },
        'click': function onClickListenerForBoolean(event){
        },
        'blur': function onBlurListenerForBoolean(event) {
            // this.dispatchEvent(new CustomEvent('update'));
        },
        */
        'change': function onChangeListenerForBoolean(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:[
        {creatorFunction:Tedede.optionsCtrl, attributes:{}},
    ]
};

Tedede.completeTypeInfo = function completeTypeInfo(typeInfoMayBeIncompleteOrString){
    var typeInfo = typeInfoMayBeIncompleteOrString;
    if(typeof typeInfo === 'string'){
        typeInfo = {typeName:typeInfo};
    }
    if(typeInfo.typeName==='boolean' && !typeInfo.options){
        typeInfo.options=BestTypes["boolean"].defaultOptions;
    }
    return typeInfo;
}

Tedede.bestCtrl = function bestCtrl(typeInfo){
    typeInfo = Tedede.completeTypeInfo(typeInfo);
    var theElement = BestTypes[typeInfo.typeName].domFixtures.reduce(function(elementoCreado, def){
        if(elementoCreado){
            return elementoCreado;
        }
        return Tedede.createFromFixture(def, typeInfo);
    }, null);
    return theElement;
}

Tedede.adaptElement = function adaptElement(domElement, typeInfo){
    typeInfo = Tedede.completeTypeInfo(typeInfo);
    var typeName = typeInfo.typeName;
    var tededeOptionGroup=domElement.getAttribute("tedede-option-group");
    if(tededeOptionGroup){
        var idElement = domElement.id||'__id__'+iiiiiiid++;
        domElement.setAttribute("tedede-option-group",idElement);
        domElement.moreInfo={};
        var childs=domElement.childNodes; 
        domElement.tededeValidOptions={};
        typeInfo.options.forEach(function(option){
            domElement.tededeValidOptions[option.option]={};
            domElement.moreInfo[option.option]={};
            var moreInfoElements=domElement.querySelectorAll('span.option-more-info[for-value="'+option.option+'"]');
            if(moreInfoElements.length>0){
                var moreInfo=moreInfoElements[0];
                domElement.moreInfo[option.option].className=moreInfo.className;
                domElement.moreInfo[option.option]          =moreInfo;
            }
            var childElements=domElement.querySelectorAll('input[type=radio][value="'+option.option+'"]');
            if(childElements.length==0){
                throw new Error('incomplete options control (value='+option.option+')');
            }else if(childElements.length>1){
                throw new Error('duplicate options in options control (value="'+option.option+'")');
            }
            var childElement = childElements[0];
            childElement.name=idElement;
            childElement.id=idElement+'-'+option.option;
            var labelsElements=domElement.querySelectorAll('label[for-value="'+option.option+'"]');
            Array.prototype.forEach.call(labelsElements, function(label){
                label.htmlFor=childElement.id;
            });
        });
        var radioChilds=domElement.querySelectorAll('input[type=radio]');
        if(radioChilds.length!=typeInfo.options.length){
            throw new Error('invalid options in options control');
        }
    }
    var dataAttr=domElement.tagName==='INPUT' || domElement.tagName==='TEXTAREA'?'value':'textContent';
    if(dataAttr==='textContent'){
        // domElement.contentEditable = false;
    }
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
    domElement.tededeTypeInfo = typeInfo;
    for(var attr in BestTypes[typeName].adapters){
        domElement[attr] = BestTypes[typeName].adapters[attr];
    }
    for(var listenerName in BestTypes[typeName].listeners || {}){
        domElement.addEventListener(listenerName, BestTypes[typeName].listeners[listenerName]);
    }
}

Tedede.createFromFixture = function createFromFixture(fixture, typeInfo){
    var thisModule = this;
    if(fixture.creatorFunction){
        return fixture.creatorFunction(typeInfo);
    }else{
        return html[fixture.tagName].call(html,fixture.attributes,(fixture.content||[]).map(function(subFixture){
            return thisModule.createFromFixture(subFixture, typeInfo);
        }));
    }
}

Tedede.connect = function connect(opts){
    opts.input.value = opts.almacen[opts.field];
}

Tedede.BestTypes = BestTypes;

return Tedede;

});