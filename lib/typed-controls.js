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

TypedControls.ENABLE_SIGNALS4ALL = false;
TypedControls.ENABLE_SIGNALS = false;
TypedControls.SIGNAL_NO_DATA='--';
TypedControls.SIGNAL_UNKNOWN_DATA='//';

var likeAr = require('like-ar');
var DialogPromise = require('dialog-promise');

TypedControls.doubleClickExpands=false;
TypedControls.showLupa=0.5;
TypedControls.showOn={
    click:true,
    focus:false,
};

TypedControls.i18n={messages:{}};
TypedControls.i18n.messages.en={
    Yes: 'Yes',
    No: 'No',
    Null: 'Null/Empty',
    pikaday: {
        previousMonth : 'Previous Month',
        nextMonth     : 'Next Month',
        months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
        weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    },
    unknownData: 'unknown data',
    noData: 'no data',
};
TypedControls.i18n.messages.es={
    Yes: 'Sí',
    No: 'No',
    Null: 'Nulo/Sin valor',
    pikaday: {
        previousMonth : 'mes anterior',
        nextMonth     : 'próximo mes',
        months        : ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
        weekdays      : ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
        weekdaysShort : ['dom','lun','mar','mié','jue','vie','sáb']
    },
    unknownData: 'ns/nc',
    noData: 'sin dato',
};

TypedControls.messages = TypedControls.i18n.messages.en;

var changing = require('best-globals').changing;
var jsToHtml = require('js-to-html');
var TypeStore = require('type-store');
var Big = require('big.js');
var Pikaday = require('pikaday');

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
        if(this.validateWhileInput()){
            if(!bestGlobals.sameValue(this.previousValue, currentValue)){
                this.dispatchEvent(new CustomEvent('update'));
                this.previousValue=currentValue;
            }
            // TODO revisar que no se esté haciendo demasiadas veces, quizás haya que primero ver si es distinto.
            this.setValidatedTypedValue(currentValue);
        }
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

var BestControls = {};

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
    return TypedControls.optionsCtrl({options: BestControls.boolean.defaultOptions});
};

BestControls.div = {
    adapters:{
        getTypedValue: function getTypedValueDate(){
            var plainValue = this.getPlainValue();
            if(plainValue==null){
                return plainValue;
            }
            var typer=this.controledType;
            return typer.fromUserInput(plainValue);
        },
        setValidatedTypedValue: function setValidatedTypedValue(typedValue){
            var typer = this.controledType;
            if(typedValue==null){
                this.setPlainValue(typedValue);
            }else{
                this.setPlainValue(typer.toLocalString(typedValue));
                if(this.tagName!=='INPUT' && typer.toHtml){
                    this.innerHTML='';
                    this.appendChild(typer.toHtml(typedValue).create());
                }
            }
        },
    },
    listeners:{
        'blur': TypedControls.normalOnBlurListener,
        'keydown': function onKeyPressListenerForDiv(event){
            var element = this;
            setTimeout(function(){
                element.validateWhileInput();
            },300);
        },
        'keypress': function onKeyPressListenerForDiv(event){
            var element = this;
            if(event.which>=32){
                var typer = this.controledType;
                var theChar = String.fromCharCode(event.which);
                if(typer.rejectedChar(theChar)){
                    if(element.expander && element.expander.autoExpand){
                        if(!element.displayingExpander){
                            var opts = {initialKeystrokes:theChar};
                            element.displayExpander(event, opts);
                            element.displayingExpander=opts;
                        }else{
                            element.displayingExpander.initialKeystrokes+=theChar;
                        }
                    }
                    event.preventDefault();
                }
            }
        },
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}},
    ]
};

BestControls.text = {
    translates:{true:{
        '\n': '\u21b5'
    },false:{}},
    translatesRegExp:{},
    translatesRev:{},
    translate: function(right, textValue){
        return textValue.replace(new RegExp(BestControls.text.translatesRegExp[right],'g'),function(chartt){
            return BestControls.text.translates[right][chartt];
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
                typedValue = BestControls.text.translate(false, typedValue);
            }
            if(typedValue==null && (this.valueEmpty || !this.controledType.nullable)){
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
                typedValue = BestControls.text.translate(true, typedValue);
            }
            if(this.tagName==='TEXTAREA' && typedValue==null){
                this.setPlainValue('');
            }else{
                this.setPlainValue(typedValue);
            }
            this.valueEmpty = typedValue==='' || typedValue==null &&  !this.controledType.nullable;
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

for(var charToTranslate in BestControls.text.translates[true]){
    BestControls.text.translates[false][BestControls.text.translates[true][charToTranslate]] = charToTranslate;
}

for(var groups in BestControls.text.translates){
    BestControls.text.translatesRegExp[groups] = '['+Object.keys(BestControls.text.translates[groups])+']';
}

BestControls.text_no_empty = {
    adapters:{
        validateTypedData: function validateTypedDataTextNoEmpty(typedValue){
            BestControls.text.adapters.validateTypedData(typedValue);
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
    domFixtures:BestControls.text.domFixtures.concat({tagName:'input', attributes:{type:'password'}})
};

BestControls.number = {
    adapters:{
        setValidatedTypedValue: function setValidatedTypedValuePrettyNumber(typedValue){
            if(isNaN(typedValue) || typedValue==null){
                this.value='';
            }else{
                this.valueAsNumber = typedValue;
            }
            if(this.value.length>1 && /[.,]/.test(this.value[this.value.length-2])){
                this.value=this.value+'0';
            }
        },
        getTypedValue: function getTypedValue(){
            return isNaN(this.valueAsNumber)||this.value==''?null:this.valueAsNumber;
        },
        // setTypedValue: function setTypedValue(value){
        //     this.valueAsNumber=value;
        // },
    },
    listeners:{
        'blur': TypedControls.normalOnBlurListener,
        'keydown': function onKeyPressListenerForDiv(event){
            var typer = this.controledType||{typeInfo:{}};
            if(TypedControls.ENABLE_SIGNALS  && typer.typeInfo.typeName!='text' || TypedControls.ENABLE_SIGNALS4ALL){
                var theKey=event.keyCode;
                // subtract or dash key
                if((theKey==109 || theKey==189) && (this.previousKey==109 || this.previousKey==189)){
                    var valueNoData;
                    if('valueNoData' in typer.typeInfo){
                        valueNoData=typer.typeInfo.valueNoData;
                    }else{
                        valueNoData=TypedControls.VALUE_NO_DATA;
                    }
                    this.value=valueNoData;
                    event.preventDefault();
                }
                //divide key or forward slash
                if((theKey==111 || theKey==191) && (this.previousKey==111 || this.previousKey==191)){
                    var valueUnknownData;
                    if('valueUnknownData' in typer.typeInfo){
                        valueUnknownData=typer.typeInfo.valueUnknownData;
                    }else{
                        valueUnknownData=TypedControls.VALUE_UNKNOWN_DATA;
                    }
                    this.value=valueUnknownData;
                    event.preventDefault();
                }
                var element = this;
                setTimeout(function(){
                    element.validateWhileInput();
                },300);
                this.previousKey=theKey;
            }
        },

        /*
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
        */
    },
    domFixtures:[
        {tagName:'input'   , attributes:{type:'text'}},
        {tagName:'input'   , attributes:{type:'number'}},
        {tagName:'div'     , attributes:{}},
    ]
};

BestControls.boolean = {
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

BestControls.boolean.defaultOptions.forEach(function(optionDefinition){
    Object.defineProperty(optionDefinition, 'label',{
        get: function(){return TypedControls.messages[optionDefinition.labelId];}
    });
});

BestControls.date = {
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
                this.controledType.setTypedValue(new Date(now.getFullYear(),now.getMonth(),now.getDate()));
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

function markActive(element, display){
    while(element && element.tagName!='BODY'){
        if(element.getAttribute('display-if-active')){
            element.setAttribute('display-is-active',display?'1':'0');
        }
        element = element.parentNode;
    }
}

var BestControls_enum = {
    adapters:{
        validateTypedData: function validateTypedValue(typedValue){
            if(typedValue!=null && !this.typedControlsValidOptions[typedValue]){
                throw new Error('Not a enum in input');
            }
        },
        getTypedValue: function getTypedValueEnum(){
            var domElement=this;
            var typedControlsOptionGroup=this.getAttribute("typed-controls-option-group");
            var typedValue = null;
            this.controledType.typeInfo.options.forEach(function(option){
                if(domElement.optionControl[option.option].checked){
                    typedValue = option.option;
                }
            });
            if(typedValue==null){
                return null;
            }
            if(this.controledType.typeName=='bigint'){
                typedValue = Number(typedValue);
            }
            return typedValue;
        },
        setValidatedTypedValue: function setValidatedTypedValuePrettyBoolean(typedValue){
            var domElement = this;
            var typedControlsOptionGroup=this.getAttribute("typed-controls-option-group");
            (domElement.shadowControl||{}).value=typedValue;
            this.controledType.typeInfo.options.forEach(function(option){
                domElement.optionControl[option.option].checked = option.option===typedValue;
            });
            this.refreshState();
        },
        refreshState: function refreshState(){
            this.controledType.typeInfo.options.forEach(function(option){
                var control = this.optionControl[option.option];
                Array.prototype.forEach.call(control.labelsElements, function(label){
                    label.setAttribute('state-label-option',control.checked?'checked':'unchecked');
                    markActive(label, control.checked);
                });
            },this);
        }
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


TypedControls.completeTypeInfo = function completeTypeInfo(typeInfoMayBeIncompleteOrString){
    var typeInfo = typeInfoMayBeIncompleteOrString;
    if(typeof typeInfo === 'string'){
        typeInfo = {typeName:typeInfo};
    }
    if(typeInfo.typeName==='boolean' && !typeInfo.options){
        typeInfo.options=BestControls.boolean.defaultOptions;
    }
    return typeInfo;
};

TypedControls.bestCtrl = function bestCtrl(typeInfo){
    typeInfo = TypedControls.completeTypeInfo(typeInfo);
    var theElement = BestControls[typeInfo.typeName].domFixtures.reduce(function(elementoCreado, def){
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
};

TypedControls.adaptElement = function adaptElement(domElement, typerOrTypeInfo){
    // typeInfo = TypedControls.completeTypeInfo(typeInfo);
    if(typeof typerOrTypeInfo === 'string'){
        throw new Error("obsolete typeName in adaptElement "+typerOrTypeInfo);
    }
    var typer;
    if(typerOrTypeInfo instanceof TypeStore.TypeBase){
        typer=typerOrTypeInfo;
    }else{
        typer = TypeStore.typerFrom(typerOrTypeInfo);
    }
    var typeName = typer.typeName;
    var typedControlsOptionGroup=domElement.getAttribute("typed-controls-option-group");
    domElement.controledType = typer;
    var bestControl=BestControls.div;
    if(domElement.tagName=='INPUT' && domElement.type=='number'){
        bestControl=BestControls.number;
    }
    if(typedControlsOptionGroup){
        var inputTypeRadio=[];
        var idElement = domElement.id||'__id__'+iiiiiiid++;
        domElement.setAttribute("typed-controls-option-group",idElement);
        domElement.typedControlsValidOptions={};
        domElement.moreInfo={};
        // var childs=domElement.childNodes; 
        domElement.optionControl={};
        var inputElement=domElement.getElementsByClassName('typed-control-input-for-options');
        inputElement = inputElement?inputElement[0]:null;
        if(inputElement){
            var setCheckbox=function(){
                var value = inputElement.value;
                if(value && domElement.optionControl[value]){
                    domElement.optionControl[value].checked = true;
                    var event = new Event('change');
                    var elem = domElement.optionControl[value];
                    elem.dispatchEvent(event);
                }else{
                    likeAr(domElement.optionControl).forEach(function(option){ option.checked=false });
                    domElement.dispatchEvent(new CustomEvent('update'));
                    domElement.refreshState()
                }
            }
            inputElement.addEventListener('keydown',function(){
                if(TypedControls.ENABLE_SIGNALS && typer.typeInfo.typeName!='text' || TypedControls.ENABLE_SIGNALS4ALL){
                    var theKey=event.keyCode;
                    // subtract or dash key
                    if((theKey==109 || theKey==189) && (this.previousKey==109 || this.previousKey==189)){
                        var valueNoData;
                        if('valueNoData' in typer.typeInfo){
                            valueNoData=typer.typeInfo.valueNoData;
                        }else{
                            valueNoData=TypedControls.VALUE_NO_DATA;
                        }
                        this.value=valueNoData;
                        setCheckbox();
                        event.preventDefault();
                    }
                    //divide key or forward slash
                    if((theKey==111 || theKey==191) && (this.previousKey==111 || this.previousKey==191)){
                        var valueUnknownData;
                        if('valueUnknownData' in typer.typeInfo){
                            valueUnknownData=typer.typeInfo.valueUnknownData;
                        }else{
                            valueUnknownData=TypedControls.VALUE_UNKNOWN_DATA;
                        }
                        this.value=valueUnknownData;
                        setCheckbox();
                        event.preventDefault();
                    }
                    this.previousKey=theKey;
                }
            })
            domElement.shadowControl = inputElement;
            inputElement.addEventListener('change',setCheckbox);
            domElement.focus = function focus(){
                inputElement.focus();
            }
        }
        typer.typeInfo.options.forEach(function(option){
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
            childElement.labelsElements = labelsElements;
            Array.prototype.forEach.call(labelsElements, function(label){
                label.htmlFor=childElement.id;
            });
            childElement.addEventListener('change',function(){
                domElement.dispatchEvent(new CustomEvent('update'));
                domElement.refreshState();
                if(inputElement){
                    inputElement.value = option.option;
                }
            });
        });
        var radioChilds=domElement.querySelectorAll('input[type=radio]');
        if(radioChilds.length!=typer.typeInfo.options.length){
            throw new Error('invalid options in options control');
        }
        domElement.disable=function(disabled){
            inputTypeRadio.forEach(function(childElement){
                childElement.disabled=disabled;
            });
        };
        domElement.getTypedValue=BestControls_enum.adapters.getTypedValue;
        domElement.validateTypedData=BestControls_enum.adapters.validateTypedData;
        domElement.setValidatedTypedValue=BestControls_enum.adapters.setValidatedTypedValue;
        domElement.refreshState=BestControls_enum.adapters.refreshState;
    }else{
        domElement.dataAttr=domElement.tagName==='INPUT' || domElement.tagName==='TEXTAREA'?'value':'textContent';
        if(domElement.dataAttr=='textContent'){
            domElement.ritchHtmlContent=true;
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
        var editable=function(typer, expander, domElement){
            return ((typer.typeInfo.editable == null || typer.typeInfo.editable) && (domElement.contentEditable=='true' || !domElement.disabled || domElement.editOnlyFromList)  || expander.whenReadOnly)
        }
        var expander = TypedControls.Expanders.find(function(expander){
            var typer = domElement.controledType;
            return editable(typer, expander, domElement) && expander.whenType(domElement);
        });
        if(expander){
            domElement.lupa=null;
            domElement.expander = expander;
            var reubicate = function reubicate(){
                if((document.activeElement === domElement || domElement.disabled) && editable(typer, expander, domElement)){
                    domElement.lupa.style.display='';
                    domElement.lupa.style.opacity=1;
                    var rect = getRect(domElement);
                    var top=rect.top+rect.height-domElement.lupa.offsetHeight/2;
                    var left=rect.left+rect.width*TypedControls.showLupa-domElement.lupa.offsetWidth/2
                    if(Math.abs(top-domElement.lupa.style.top.replace('px',''))>1.2){
                        domElement.lupa.style.top=top+'px';
                    }
                    if(Math.abs(left-domElement.lupa.style.left.replace('px',''))>1.2){
                        domElement.lupa.style.left=left+'px';
                    }
                }else if(domElement.lupa){
                    if(domElement.lupa.timerReubicate){
                        clearInterval(domElement.lupa.timerReubicate);
                    }
                    document.body.removeChild(domElement.lupa);
                    domElement.lupa=null;
                }
            };
            var quitarLupa = function quitarLupa(domElement){
                if(domElement.lupa){
                    clearInterval(domElement.lupa.timerReubicate);
                    domElement.lupa.timerReubicate=null;
                    // domElement.lupa.timerReubicate = setInterval(reubicate,500);
                    domElement.lupa.style.opacity=0.01;
                    clearTimeout(domElement.lupa.timerClose);
                    domElement.lupa.timerClose=null;
                }
            }
            var displayExpander = function displayExpander(event, opts){
                if(editable(typer, expander, domElement)){
                    domElement.updatingSuspended=true;
                    var dialogFinally = function dialogFinally(){
                        domElement.updatingSuspended=false;
                        domElement.focus();
                        domElement.dispatchEvent(new Event('input'));
                        domElement.dispatchEvent(new CustomEvent('update'));
                    };
                    domElement.expander.dialogInput(domElement, opts).then(dialogFinally,dialogFinally);
                    event.preventDefault();
                    quitarLupa(domElement);
                }
            };
            domElement.displayExpander = displayExpander;
            if(TypedControls.doubleClickExpands){
                domElement.addEventListener('dblclick',function(){
                    if(domElement.textContent==''){
                        displayExpander(event);
                    }
                });
            }
            ['focus','click'].forEach(function(eventName){
                if(TypedControls.showLupa && TypedControls.showOn[eventName]){
                    domElement.addEventListener(eventName, function(){
                        if(!domElement.lupa){
                            domElement.lupa = html.img({src:TypedControls.path.img+(domElement.expander.img||'lookdown.png'), class:'img-lupa', style:'position:absolute; display:none'}).create();
                            document.body.appendChild(domElement.lupa);
                            domElement.lupa.addEventListener('load', reubicate);
                            domElement.lupa.addEventListener('click',displayExpander);
                            domElement.lupa.timerReubicate = setInterval(reubicate,500);
                        }else if(domElement.lupa.timerClose){
                            clearTimeout(domElement.lupa.timerClose);
                        }
                        domElement.lupa.timerClose = setTimeout(function(){
                            quitarLupa(domElement);
                        },5000);
                        setTimeout(reubicate,10);
                    });
                }
            });
            domElement.addEventListener('blur', function(){
                quitarLupa(domElement);
            });
            domElement.addEventListener('keydown', function(event){
                var domElement = this;
                if(event.keyCode == 120 && !event.shiftKey && !event.ctrlKey && !event.altKey
                  || event.which == 40  && !event.shiftKey && !event.ctrlKey &&  event.altKey
                ){ //F9   alt down
                    if(!domElement.updatingSuspended){
                        displayExpander(event);
                    }
                }
            });
        }
        domElement.setAttribute("type-align",typer.align);
        domElement.getPlainValue = function getPlainValue(){
            return this[this.dataAttr]===''?this.controledType.emptyValue:this[this.dataAttr];
        };
        domElement.setPlainValue = function setPlainValue(plainValue){
            if(this.tagName=='INPUT' && this.type=='number'){
                // alert('aca')
            }
            this[this.dataAttr] = plainValue;
        };
        domElement.setValidatedTypedValue = function setValidatedTypedValue(typedValue){
            var typer=this.controledType;
            this.setPlainValue(typedValue==null?'':typer.toLocalString(typedValue));
            if(this.ritchHtmlContent){
                this.innerHTML="";
                if(typedValue==null){
                    this.appendChild(html.span({class:'null-value'}).create());
                }else{
                    this.appendChild(typer.toHtml(typedValue).create());
                }
            }
        };
        domElement.validateWhileInput = function validateWhileInput(){
            var plainValue = this.getPlainValue();
            var typer = this.controledType||{typeInfo:{}};
            if(TypedControls.ENABLE_SIGNALS && typer.typeInfo.typeName!='text' || TypedControls.ENABLE_SIGNALS4ALL){
                /* NO DATA SIGNAL */
                var valueNoData;
                if('valueNoData' in typer.typeInfo){
                    valueNoData=typer.typeInfo.valueNoData;
                }else{
                    valueNoData=TypedControls.VALUE_NO_DATA;
                }
                if(plainValue===TypedControls.SIGNAL_NO_DATA || plainValue===valueNoData){
                    this.setAttribute('typed-controls-signal-no-data','1');
                    if(plainValue===TypedControls.SIGNAL_NO_DATA){
                        this.setPlainValue(valueNoData);
                    }
                }else{
                    this.removeAttribute('typed-controls-signal-no-data');
                }
                /* FIN NO DATA SIGNAL */
                /* UNKNONWN DATA SIGNAL */
                var valueUnknownData;
                if('valueUnknownData' in typer.typeInfo){
                    valueUnknownData=typer.typeInfo.valueUnknownData;
                }else{
                    valueUnknownData=TypedControls.VALUE_UNKNOWN_DATA;
                }
                if(plainValue===TypedControls.SIGNAL_UNKNOWN_DATA || plainValue===valueUnknownData){
                    this.setAttribute('typed-controls-signal-unknown-data','1');
                    if(plainValue===TypedControls.SIGNAL_UNKNOWN_DATA){
                        this.setPlainValue(valueUnknownData);
                    }
                }else{
                    this.removeAttribute('typed-controls-signal-unknown-data');
                }
                /* FIN UNKNONWN DATA SIGNAL */
            }
            if(plainValue==null){
                this.setAttribute('typed-controls-status','null');
            }else{
                var typer = this.controledType;
                var reason = !typer.isValidLocalString(plainValue);
                if(reason){
                    this.setAttribute('typed-controls-status','error');
                }else{
                    this.setAttribute('typed-controls-status','ok');
                }
            }
            return !reason;
        }
        for(var attr in bestControl.adapters){
            domElement[attr] = bestControl.adapters[attr];
        }
        for(var listenerName in bestControl.listeners || {}){
            domElement.addEventListener(listenerName, bestControl.listeners[listenerName]);
        }
    }
    domElement.removeDialogPromiseSetup = function removeDialogPromiseSetup(){
        this.dialogPromiseSetup = null
    }

    domElement.setDialogPromiseSetup = function setDialogPromiseSetup(setup){
        var defaultCatchFun = function(err){
            console.log('catch from dialogPromise in typed-controls: ', err)
        };
        var preDialogFun = function(){
            return Promise.resolve();
        };
        this.dialogPromiseSetup = changing({catchFun:defaultCatchFun, preDialogFun: preDialogFun}, setup);
    }
    domElement.setTypedValue = function setTypedValue(typedValue, fromUserInteraction){
        var self = this
        var isSameValue;
        if(setup){
            isSameValue = bestGlobals.sameValue(self.previousValue, typedValue);
        }
        var setTypedValueFun = function setTypedValueFun(){
            var typer=self.controledType;
            typer.validateTypedData(typedValue);
            if(!setup){
                isSameValue = bestGlobals.sameValue(self.previousValue, typedValue);
            }
            if(TypedControls.ENABLE_SIGNALS){
                var plainValue = typedValue && typer.typeInfo.typeName=='date'?typedValue.toLocaleDateString():typedValue;
                if(plainValue==TypedControls.SIGNAL_UNKNOWN_DATA || plainValue==TypedControls.VALUE_UNKNOWN_DATA || 
                    (self.controledType.typeInfo.valueUnknownData && self.controledType.typeInfo.valueUnknownData == plainValue)){
                    self.setAttribute('typed-controls-signal-unknown-data','1');
                }else{
                    self.removeAttribute('typed-controls-signal-unknown-data');
                }
                if(plainValue==TypedControls.SIGNAL_NO_DATA || plainValue==TypedControls.VALUE_NO_DATA ||
                    (self.controledType.typeInfo.valueNoData && self.controledType.typeInfo.valueNoData == plainValue)){
                    self.setAttribute('typed-controls-signal-no-data','1');
                }else{
                    self.removeAttribute('typed-controls-signal-no-data');
                }
            }
            self.setValidatedTypedValue(typedValue);
            if(fromUserInteraction){
                if(!isSameValue){
                    self.dispatchEvent(new CustomEvent('update'));
                }
            }
            self.previousValue=typedValue;
        }
        var setup = self.dialogPromiseSetup;
        if(setup && !isSameValue && !setup.ignoreValues.find(function(value){
            return value==typedValue;
        })){
            switch(setup.dialogType){
                case 'alertPromise':
                    setup.preDialogFun(self, typedValue).then(function(){
                        alertPromise(setup.message,setup.opts).then(function(){
                            setTypedValueFun();
                        }).catch(function(err){
                            setup.catchFun(err);
                        });
                    });
                break;
                case 'promptPromise':
                    setup.preDialogFun(self, typedValue).then(function(){
                        promptPromise(setup.message,setup.opts).then(function(text){
                            if(setup.expectedValue && text == setup.expectedValue){
                                setTypedValueFun();
                            }
                        }).catch(function(err){
                            setup.catchFun(err);
                        });
                    })
                break; 
                default:
                    setup.preDialogFun(self, typedValue).then(function(){
                        confirmPromise(setup.message,setup.opts).then(function(){
                            setTypedValueFun();
                        }).catch(function(err){
                            setup.catchFun(err);
                        });
                    });
                break;
            }
        }else{
            setTypedValueFun();
        }
    };
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

likeAr(TypeStore.type).forEach(function(typeDef, typeName){
    // if(!(typeName in BestControls) || ){
        var typer=new typeDef();
        if(!typer.typedControlName){
            throw new Error('typed-controls: lack of typedControlName in type-store for '+typeName);
        }
        // BestControls[typeName] = changing(BestControls[actualType.typedControlName],{});
        /*
        ['validateTypedData', 'fromString', 'toPlainString', 'toJsHtml'].forEach(function(adapterName){
            if(adapterName in actualType){
                BestControls[typeName].adapters[adapterName] = actualType[adapterName].bind(actualType);
            }
        });
        */
    // }
});

TypedControls.BestControls = BestControls;

TypedControls.Expanders = [];

TypedControls.pickDate = function pickDate(actualValue, label, opts){
    return dialogPromise(function(dialogWindow, closeWindow){
        var button=html.button(DialogPromise.messages.Ok).create();
        var divPicker=html.div({id:'datepicker'}).create();
        var picker = new Pikaday({
            defaultDate: actualValue,
            onSelect: function(date) {
                closeWindow(bestGlobals.date(date));
            },
            i18n:TypedControls.messages.pikaday,
            showDaysInNextAndPreviousMonths: true
        });
        divPicker.appendChild(picker.el);
        button.addEventListener('click',function(){
            closeWindow(actualValue);
        });
        dialogWindow.appendChild(html.div([
             html.div(label),
             html.div([divPicker]),
             html.div([button])
        ]).create());
    }, opts)
}

if(window.miniMenuPromise){
    window.addEventListener('load', function(){
        TypedControls.Expanders.push({
            whenType: function(typedControl){ 
                var typeInfo = typedControl.controledType.typeInfo;
                return typeInfo.typeName === 'boolean';
            },
            dialogInput: function(typedControl){
                var typeInfo = typedControl.controledType.typeInfo;
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
                var typeInfo = typedControl.controledType.typeInfo;
                return typeInfo.options;
            },
            dialogInput: function(typedControl){
                var typeInfo = typedControl.controledType.typeInfo;
                var opts=typeInfo.options.map(function(opt, i){
                    if(typeof opt === 'string'){
                        return {value:opt, labels:[opt]};
                    }
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
        TypedControls.Expanders.push({
            whenType: function(typedControl){ 
                var typer = typedControl.controledType;
                return typer.typeInfo.typeName == 'date';
            },
            img:'lookdown-calendar.png',
            dialogInput: function(typedControl){
                var typer = typedControl.controledType;
                var actualValue = typedControl.getTypedValue();
                return TypedControls.pickDate(actualValue, typer.typeInfo.label, {
                    underElement:typedControl,
                    withCloseButton:false,
                }).then(function(value){
                    typedControl.setTypedValue(value);
                    typedControl.dispatchEvent(new CustomEvent('update'));
                }).catch(function(err){
                    if(!DialogPromise){
                        return alertPromise(err.message);
                    }
                });
            }
        });
        TypedControls.Expanders.push({
            whenType: function(typedControl){ 
                var typer = typedControl.controledType;
                return !typer.typeInfo.clientSide;
            },
            whenReadOnly:true,
            img:'lookdown-zoom.png',
            dialogInput: function(typedControl){
                var typer = typedControl.controledType;
                var value = typedControl.getTypedValue();
                var actualValue = value==null?'':typer.toLocalString(value);
                if(typedControl.disabled){
                    var div=html.div().create();
                    div.innerHTML=typedControl.innerHTML;
                    return alertPromise(div,{
                        underElement:typedControl,
                        withCloseButton:false,
                    });
                }
                return promptPromise(typer.typeInfo.label||'', actualValue,{
                    underElement:typedControl,
                    withCloseButton:false,
                }).then(function(text){
                    var value=typer.fromLocalString(text);
                    typedControl.setTypedValue(value);
                    typedControl.dispatchEvent(new CustomEvent('update'));
                }).catch(function(err){
                    if(!DialogPromise){
                        return alertPromise(err.message);
                    }
                });
            }
        });
    });
}

return TypedControls;

});