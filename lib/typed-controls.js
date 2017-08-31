"use strict";

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
})(/*jshint -W040 */this, 'TypedControls', function() {
/*jshint +W040 */

/*jshint -W004 */
var TypedControls = {};
/*jshint +W004 */

TypedControls.messages={
    Yes: 'Yes',
    No: 'No',
    Null: 'Null/Empty'
};

TypedControls.es={
    Yes: 'Sí',
    No: 'No',
    Null: 'Nulo/Sin valor'
};

var changing = require('best-globals').changing;
var jsToHtml = require('js-to-html');
var typeStore = require('type-store');
var Big = require('big.js');

var html=jsToHtml.html;
// var coalesce = bestGlobals.coalesce;
// var changing = bestGlobals.changing;

TypedControls.Form = function Form(formInfo, medium){
    this.info=formInfo;
    this.medium=medium;
};

TypedControls.Form.prototype.render = function render(container){
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
};

TypedControls.createForm = function createForm(formInfo, data){
    var form = new this.Form(formInfo, data);
    return form;
};

TypedControls.normalOnBlurListener = function normalOnBlurListener(event){
    if(!this.updatingSuspended){
        var currentValue=this.getTypedValue();
        // if(){
        //     
        // }
        this.dispatchEvent(new CustomEvent('update'));
    }
};

(function () {
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

TypedControls.optionsCtrl = function optionsCtrl(typeInfo){
    var options = typeInfo.options;
    return html.div({"typed-controls-option-group": 'simple-option'},
        options.map(function(option){
            return html.div([
                (typeInfo.showOption?html.label({"for-value": option.option},option.option):null), 
                html.input({type:'radio', value:option.option}), 
                html.label({"for-value": option.option},option.label), 
                (option.more?html.span({"for-value": option.option, "class":"option-more-info"}):null)
            ]);
        })
    );
};

TypedControls.booleanCtrl = function booleanCtrl(){
    return TypedControls.optionsCtrl({options: BestTypes.boolean.defaultOptions});
};

BestTypes.text = {
    translates:{true:{
        '\n': '\u21b5'
    },false:{}},
    translatesRegExp:{},
    translatesRev:{},
    translate: function(right, textValue){
        return textValue.replace(new RegExp(BestTypes.text.translatesRegExp[right],'g'),function(chartt){
            return BestTypes.text.translates[right][chartt];
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
                typedValue = BestTypes.text.translate(false, typedValue);
            }
            if(typedValue==null && this.valueEmpty){
                return '';
            }else{
                if(typedValue!=null){
                    return typedValue.replace(/\n+$/,'');
                }
                return typedValue;
            }
        },
        setValidatedTypedValue: function setValidatedTypedValueText(typedValue){
            if(this.tagName==='INPUT' && typedValue!=null){
                typedValue = BestTypes.text.translate(true, typedValue);
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
        'blur': TypedControls.normalOnBlurListener
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}, mainUpdateEventName:'blur'},
        {tagName:'div'     , attributes:{}           },
        {tagName:'textarea', attributes:{}},
    ]
};

for(var charToTranslate in BestTypes.text.translates[true]){
    BestTypes.text.translates[false][BestTypes.text.translates[true][charToTranslate]] = charToTranslate;
}

for(var groups in BestTypes.text.translates){
    BestTypes.text.translatesRegExp[groups] = '['+Object.keys(BestTypes.text.translates[groups])+']';
}

BestTypes.text_no_empty = {
    adapters:{
        validateTypedData: function validateTypedDataTextNoEmpty(typedValue){
            BestTypes.text.adapters.validateTypedData(typedValue);
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
        'blur': TypedControls.normalOnBlurListener
    },
    domFixtures:BestTypes.text.domFixtures.concat({tagName:'input', attributes:{type:'password'}})
};

BestTypes.number = {
    adapters:{
        validateTypedData: function validateTypedDataNumber(typedValue){
            if(typedValue!=null && typeof typedValue !== "number" && !(typedValue instanceof Big)){
                throw new Error('Not a Number in input is '+typeof typedValue);
            }
            if('minValue' in this.controledTypeInfo && typedValue<this.controledTypeInfo.minValue){
                throw new Error('The value is lower than '+this.controledTypeInfo.minValue);
            }
            if('maxValue' in this.controledTypeInfo && typedValue>this.controledTypeInfo.maxValue){
                throw new Error('The value is greater than '+this.controledTypeInfo.maxValue);
            }
            if(this.controledTypeInfo.onlyInt && typedValue%1!==0){ //! OJO: Revisar esta forma no estándar
                throw new Error('The value is not an integer');
            }
        },
        fromString: function fromStringNumber(value){
            return typeStore.type.bigint.fromString(value);
        },
        getTypedValue: function getTypedValueNumber(){
            var value = this.getPlainValue();
            if(value===null){
                return null;
            }else{
                value = this.fromString(value);
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
                var formated = str.replace(/^([-+]?[0-9 ]*)((\.)([0-9 ]*))?$/, function(str, left, dotPart, dot, decimals){
                    var rta = [];
                    left.replace(/^([-+]?)([0-9]?[0-9]?)(([0-9][0-9][0-9])*)$/, function(str, sign, prefix, triplets){
                        if(sign=='-'){
                            rta.push(html.span({class: "number_sign"}, sign));
                        }
                        if(prefix){
                            rta.push(html.span({"class": "number_miles"}, prefix));
                        }
                        triplets.replace(/[0-9][0-9][0-9]/g,function(triplet){
                            rta.push(html.span({"class": "number_miles"}, triplet));
                        });
                    });
                    if(dot){
                        rta.push(html.span({"class": "number_dot"},dot));
                    }
                    if(decimals){
                        rta.push(html.span({"class": "number_decimals"},decimals));
                    }
                    return rta.map(function(x){ return x.toHtmlText(); }).join('');
                });
                this.innerHTML = formated;
            }
        },
    },
    listeners:{
        'blur': TypedControls.normalOnBlurListener,
        'keypress': function onKeyPressListenerForNumber(event){
            if( event.keyCode>=32 && event.keyCode<=43 ||
                event.keyCode>=47 && event.keyCode<=47 ||
                event.keyCode>=58
            ){
                event.preventDefault();
            }
        },
        'keyup': function onKeyUpListenerForNumber(event){
            var targetName='value' in this?'value':'textContent';
            if(!this[targetName].match(/^-?[0-9]*\.?[0-9]*$/)){
                var negative=this[targetName][0]==='-';
                var newValue=this[targetName].replace(/[^0-9.]/g,'');
                newValue=newValue.replace(/[.]/,',');
                newValue=newValue.replace(/[.]/g,'');
                newValue=newValue.replace(/[,]/g,'.');
                this[targetName]=(negative?'-':'')+newValue;
            }
        }
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'input'   , attributes:{type:'number'}},
        {tagName:'div'     , attributes:{}},
    ]
};

BestTypes.boolean = {
    adapters:{
        validateTypedData: function validateTypedDataBoolean(typedValue){
            if(typedValue!==false && typedValue!==true && typedValue!=null){
                throw new Error('Not a boolean in input');
            }
        },
        getTypedValue: function getTypedValueBoolean(){
            var domElement=this;
            var typedControlsOptionGroup=this.getAttribute("typed-controls-option-group");
            if(typedControlsOptionGroup){
                var typedValue = null;
                [true, false].forEach(function(value){
                    if(domElement.optionControl[value].checked){
                        typedValue = value;
                    }
                });
                return typedValue;
            }else if(this.type==='checkbox'){
                return this.indeterminate?null:this.checked;
            }else{
                var value = this.getPlainValue();
                var falseInitials={'n':true,'N':true,'0':true,'2':true,'F':true,'f':true,'\u043d':true,'\u041d':true};
                if(value==null){
                    return null;
                }else{
                    return !falseInitials[value.trim()[0]];
                }
            }
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyBoolean(typedValue){
            var domElement=this;
            var typedControlsOptionGroup=this.getAttribute("typed-controls-option-group");
            if(typedControlsOptionGroup){
                [true, false].forEach(function(value){
                    domElement.optionControl[value].checked = value===typedValue;
                });
            }else if(this.type==='checkbox'){
                this.checked = typedValue;
                this.indeterminate = typedValue==null;
            }else{
                var plainValue = typedValue==null?'':(typedValue?TypedControls.messages.Yes:TypedControls.messages.No);
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
                event.keyCode == 8   || //backspace
                event.keyCode == 46  || //delete/Supr
                event.keyCode == 109 || //'-'/minus in keypad
                event.keyCode == 189 || //'-'/minus in keyboard
                event.keyCode == 190    //'.'/period in keyboard
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
        'blur': TypedControls.normalOnBlurListener,
        'change': function onChangeListenerForBoolean(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:[
        {creatorFunction:TypedControls.booleanCtrl, attributes:{}},
        {tagName:'div'     , attributes:{}},
        {tagName:'input'   , attributes:{type:'text'}, mainUpdateEventName:'blur'},
        {tagName:'input'   , attributes:{type:'checkbox'}, mainUpdateEventName:'change'},
    ],
    defaultOptions:[
        {option: true , labelId: 'Yes'}, 
        {option: false, labelId: 'No'},
    ]
};

BestTypes.boolean.defaultOptions.forEach(function(optionDefinition){
    Object.defineProperty(optionDefinition, 'label',{
        get: function(){return TypedControls.messages[optionDefinition.labelId];}
    });
});

BestTypes.date = {
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
            var parts;
            if(plainValue==null){
                return null;
            }else if (this.type==='date') {
                parts = plainValue.split(/[-\/]/);
                return new Date(parts[0],parts[1]-1,parts[2]);
            }else{
                parts = plainValue.split(/[-\/]/);
                return new Date(parts[2],parts[1]-1,parts[0]);
            }
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
                    this.innerHTML = rta;
                }
            }
            
        },
    },
    listeners:{
        'blur': TypedControls.normalOnBlurListener,
        'keydown': function onKeyDownListenerForDate(event){
            if(event.keyCode == 72) { // key h
                var now=new Date();
                this.controledTypeInfo.setTypedValue(new Date(now.getFullYear(),now.getMonth(),now.getDate()));
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

BestTypes.enum = {
    adapters:{
        validateTypedData: function validateTypedDataBoolean(typedValue){
            if(typedValue!=null && !this.typedControlsValidOptions[typedValue]){
                throw new Error('Not a enum in input');
            }
        },
        getTypedValue: function getTypedValueEnum(){
            var domElement=this;
            var typedControlsOptionGroup=this.getAttribute("typed-controls-option-group");
            //if(typedControlsOptionGroup){
                var typedValue = null;
                this.controledTypeInfo.options.forEach(function(option){
                    if(domElement.optionControl[option.option].checked){
                        typedValue = option.option;
                    }
                });
                return typedValue;
            //}
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyBoolean(typedValue){
            var domElement = this;
            var typedControlsOptionGroup=this.getAttribute("typed-controls-option-group");
            //if(typedControlsOptionGroup){ 
                this.controledTypeInfo.options.forEach(function(option){
                    domElement.optionControl[option.option].checked = option.option===typedValue;
                });
            //}
        },
    },
    listeners:{
        /* TODO:
        'keydown': function onKeyDownListenerForBoolean(event){
        },
        'click': function onClickListenerForBoolean(event){
        },
        'blur': TypedControls.normalOnBlurListener,
        */
        'change': function onChangeListenerForBoolean(event) {
            this.dispatchEvent(new CustomEvent('update'));
        }
    },
    domFixtures:[
        {creatorFunction:TypedControls.optionsCtrl, attributes:{}},
    ]
};

BestTypes["FROM:type-store"] = {
    adapters:{
        getTypedValue: function getTypedValueDate(){
            var plainValue = this.getPlainValue();
            if(plainValue==null){
                return plainValue;
            }
            var typer=this.controledTypeInfo;
            console.log("·······························",typer.fromString)
            return typer.fromString(plainValue);
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyDate(typedValue){
             if(typedValue==null){
                this.setPlainValue(typedValue);
            }else{
                this.setPlainValue(this.toPlainString(typedValue));
                if(this.tagName!=='INPUT' && this.toJsHtml){
                    this.innerHTML='';
                    this.appendChild(this.toJsHtml(typedValue).create());
                }
            }
        },
    },
    listeners:{
        'blur': TypedControls.normalOnBlurListener,
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}},
    ]
};

TypedControls.completeTypeInfo = function completeTypeInfo(typeInfoMayBeIncompleteOrString){
    var typeInfo = typeInfoMayBeIncompleteOrString;
    if(typeof typeInfo === 'string'){
        typeInfo = {typeName:typeInfo};
    }
    if(typeInfo.typeName==='boolean' && !typeInfo.options){
        typeInfo.options=BestTypes.boolean.defaultOptions;
    }
    return typeInfo;
};

TypedControls.bestCtrl = function bestCtrl(typeInfo){
    typeInfo = TypedControls.completeTypeInfo(typeInfo);
    var theElement = BestTypes[typeInfo.typeName].domFixtures.reduce(function(elementoCreado, def){
        if(elementoCreado){
            return elementoCreado;
        }
        return TypedControls.createFromFixture(def, typeInfo);
    }, null);
    return theElement;
};

function getRect(element){
    var rect = {top:0, left:0, width:element.offsetWidth, height:element.offsetHeight};
    while( element != null ) {
        rect.top += element.offsetTop;
        rect.left += element.offsetLeft;
        element = element.offsetParent;
    }
    return rect;
}

TypedControls.path={
    img:''
}

TypedControls.adaptElement = function adaptElement(domElement, typeInfo){
    // typeInfo = TypedControls.completeTypeInfo(typeInfo);
    var typeName = typeInfo.typeName;
    var typedControlsOptionGroup=domElement.getAttribute("typed-controls-option-group");
    domElement.controledTypeInfo = typeInfo;
    if(typedControlsOptionGroup){
        var inputTypeRadio=[];
        var idElement = domElement.id||'__id__'+iiiiiiid++;
        domElement.setAttribute("typed-controls-option-group",idElement);
        domElement.typedControlsValidOptions={};
        domElement.moreInfo={};
        // var childs=domElement.childNodes; 
        domElement.optionControl={};
        typeInfo.options.forEach(function(option){
            domElement.typedControlsValidOptions[option.option]={};
            domElement.moreInfo[option.option]={};
            var moreInfoElements=domElement.querySelectorAll('span.option-more-info[for-value="'+option.option+'"]');
            if(moreInfoElements.length>0){
                var moreInfo=moreInfoElements[0];
                domElement.moreInfo[option.option].className=moreInfo.className;
                domElement.moreInfo[option.option]          =moreInfo;
            }
            var childElements=domElement.querySelectorAll('input[type=radio][value="'+option.option+'"]');
            if(childElements.length===0){
                throw new Error('incomplete options control (value='+option.option+')');
            }else if(childElements.length>1){
                throw new Error('duplicate options in options control (value="'+option.option+'")');
            }
            var childElement = childElements[0];
            domElement.optionControl[option.option]=childElement;
            inputTypeRadio.push(childElement);
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
        domElement.disable=function(disabled){
            inputTypeRadio.forEach(function(childElement){
                childElement.disabled=disabled;
            });
        };
    }else{
        var dataAttr=domElement.tagName==='INPUT' || domElement.tagName==='TEXTAREA'?'value':'textContent';
        if(dataAttr=='value'){
            domElement.typedControlViaValue=true;
        }
        if(domElement.getAttribute("typed-controls-direct-input") && domElement.getAttribute("typed-controls-direct-input")==='true'){
            domElement.contentEditable = true;
            domElement.disable=function(disabled){
                domElement.disabled=disabled;
                domElement.contentEditable = !disabled;
            };
        }else{
            domElement.disable=function(disabled){
                domElement.disabled=disabled;
            };
        }
        var expander = TypedControls.Expanders.find(function(expander){
            return expander.whenType(domElement);
        });
        if(expander){
            domElement.lupa=null;
            var reubicate = function reubicate(){
                if(document.activeElement === domElement){
                    domElement.lupa.style.display='';
                    domElement.lupa.style.opacity=1;
                    var rect = getRect(domElement);
                    domElement.lupa.style.top=rect.top+rect.height-domElement.lupa.offsetHeight/2+'px';
                    domElement.lupa.style.left=rect.left+rect.width-domElement.lupa.offsetWidth/2+'px';
                }else if(domElement.lupa){
                    if(domElement.lupa.timerReubicate){
                        clearInterval(domElement.lupa.timerReubicate);
                    }
                    document.body.removeChild(domElement.lupa);
                    domElement.lupa=null;
                }
            }
            var displayExpander = function displayExpander(){
                domElement.updatingSuspended=true;
                var dialogFinally = function dialogFinally(){
                    domElement.updatingSuspended=false;
                    domElement.focus();
                    domElement.dispatchEvent(new CustomEvent('update'));
                }
                expander.dialogInput(domElement).then(dialogFinally,dialogFinally);
            }
            domElement.addEventListener('focus', function(){
                if(!domElement.lupa){
                    domElement.lupa = html.img({src:TypedControls.path.img+'lupa.png', class:'lupa-typed-controls', style:'position:absolute; display:none'}).create();
                    document.body.appendChild(domElement.lupa);
                    domElement.lupa.addEventListener('load', reubicate);
                    domElement.lupa.addEventListener('click',displayExpander);
                    domElement.lupa.timerReubicate = setInterval(reubicate,500);
                }
                setTimeout(reubicate,10);
            });
            domElement.addEventListener('blur', function(){
                clearInterval(domElement.lupa.timerReubicate);
                domElement.lupa.timerReubicate = setInterval(reubicate,500);
                domElement.lupa.style.opacity=0.01;
            });
            domElement.addEventListener('keydown', function(event){
                var domElement = this;
                if(event.keyCode == 119 && !event.shiftKey && !event.ctrlKey && !event.altKey){ //F8
                    displayExpander();
                    event.preventDefault();
                }
            });
        }
    }
    domElement.getPlainValue = function getPlainValue(/*plainValue*/){
        return this[dataAttr]===''?null:this[dataAttr];
    };
    domElement.setPlainValue = function setPlainValue(plainValue){
        this[dataAttr] = plainValue;
    };
    domElement.setTypedValue = function setTypedValue(typedValue){
        var typer=this.controledTypeInfo;
        typer.validateTypedData(typedValue);
        if(this.typedControlViaValue){
            if(typedValue==null){
                this.value = '';
            }else{
                this.value = typer.toPlainString(typedValue);
            }
        }else{
            this.innerHTML="";
            if(typedValue==null){
                this.appendChild(html.span({class:'null-value'}).create());
            }else{
                this.appendChild(typer.toHtml(typedValue).create());
            }
        }
    };
    for(var attr in BestTypes["FROM:type-store"].adapters){
        domElement[attr] = BestTypes["FROM:type-store"].adapters[attr];
    }
    for(var listenerName in BestTypes["FROM:type-store"].listeners || {}){
        domElement.addEventListener(listenerName, BestTypes["FROM:type-store"].listeners[listenerName]);
    }
};

TypedControls.createFromFixture = function createFromFixture(fixture, typeInfo){
    var thisModule = this;
    if(fixture.creatorFunction){
        return fixture.creatorFunction(typeInfo);
    }else{
        return html[fixture.tagName](fixture.attributes,(fixture.content||[]).map(function(subFixture){
            return thisModule.createFromFixture(subFixture, typeInfo);
        }));
    }
};

TypedControls.connect = function connect(opts){
    opts.input.value = opts.almacen[opts.field];
};

likeAr(typeStore.type).forEach(function(typeDef, typeName){
    // if(!(typeName in BestTypes) || ){
        var actualType=new typeDef();
        if(!actualType.typedControlName){
            throw new Error('typed-controls: lack of typedControlName in type-store for '+typeName);
        }
        BestTypes[typeName] = changing(BestTypes[actualType.typedControlName],{});
        /*
        ['validateTypedData', 'fromString', 'toPlainString', 'toJsHtml'].forEach(function(adapterName){
            if(adapterName in actualType){
                BestTypes[typeName].adapters[adapterName] = actualType[adapterName].bind(actualType);
            }
        });
        */
    // }
});

TypedControls.BestTypes = BestTypes;

TypedControls.Expanders = [];

if(window.miniMenuPromise){
    window.addEventListener('load', function(){
        TypedControls.Expanders.push({
            whenType: function(typedControl){ 
                var typeInfo = typedControl.controledTypeInfo;
                return typeInfo.typeName === 'boolean';
            },
            dialogInput: function(typedControl){
                var typeInfo = typedControl.controledTypeInfo;
                var opts=[
                    {value:true , label:TypedControls.messages.Yes},
                    {value:false, label:TypedControls.messages.No},
                ];
                if(typeInfo.nullable){
                    opts.push({value:null, label:TypedControls.messages.Null});
                }
                return miniMenuPromise(opts,{
                    underElement:typedControl,
                    withCloseButton:false,
                }).then(function(value){
                    typedControl.setTypedValue(value);
                    typedControl.dispatchEvent(new CustomEvent('udpdate'));
                });
            }
        });
        TypedControls.Expanders.push({
            whenType: function(typedControl){ 
                var typeInfo = typedControl.controledTypeInfo;
                return typeInfo.options;
            },
            dialogInput: function(typedControl){
                var typeInfo = typedControl.controledTypeInfo;
                var opts=typeInfo.options.map(function(opt){
                    return {value:opt.option, labels:[opt.option, opt.label]};
                });
                if(typeInfo.nullable){
                    opts.push({value:null, labels:['',TypedControls.messages.Null]});
                }
                return miniMenuPromise(opts,{
                    underElement:typedControl,
                    withCloseButton:false,
                }).then(function(value){
                    typedControl.setTypedValue(value);
                    typedControl.dispatchEvent(new CustomEvent('udpdate'));
                });
            }
        });
    });
}

return TypedControls;

});