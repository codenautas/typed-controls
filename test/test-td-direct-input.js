"use strict";

// TDs with "typed-controls-direct-input", adapted with a typeInfo: the way backend-plus builds the editable grids

var html=require('js-to-html').html;
var discrepances = require('discrepances');

function createDirectInputTd(typeInfo){
    var table = html.table([html.tr([html.td({"typed-controls-direct-input":"true"})])]).create();
    document.body.appendChild(table);
    var td = table.rows[0].cells[0];
    TypedControls.adaptElement(td, typeInfo);
    return td;
}

function removeTd(td){
    var table = td.closest('table');
    table.parentNode.removeChild(table);
}

function userTypes(td, text){
    td.textContent = text;
    td.dispatchEvent(new Event('blur'));
}

// A synthetic event does not carry the same data in every browser (in Firefox the "which" of a KeyboardEvent
// and the clipboardData of a ClipboardEvent arrived empty), so the data that the listeners read is defined on the event itself.
function keypressEvent(char){
    var event = new Event('keypress', {cancelable:true});
    Object.defineProperty(event, 'which', {value:char.charCodeAt(0)}); // eslint-disable-line unicorn/prefer-code-point -- it must be the inverse of String.fromCharCode(event.which) used in the library
    return event;
}

function pasteEvent(text){
    var event = new Event('paste', {cancelable:true});
    Object.defineProperty(event, 'clipboardData', {value:{getData:function(){ return text; }}});
    return event;
}

function countUpdates(td){
    var counter = {updates:0};
    td.addEventListener('update', function(){ counter.updates++; });
    return counter;
}

var typesToTest = {
    text: {validValues:['hello', 'two words'], invalidValues:[42, true, {}]},
    integer: {validValues:[42, -7, 0], invalidValues:['42', true]},
    bigint: {validValues:[42, -7], invalidValues:['42', true]},
    decimal: {validValues:[42, 12.5, new Big('12345.1259876543219876543210101')], invalidValues:['42', true]},
    date: {validValues:[bestGlobals.date.iso('2026-10-24')], invalidValues:['2026-10-24', 42, new Date()]},
    boolean: {validValues:[true, false], invalidValues:['true', 1]},
    interval: {validValues:[new bestGlobals.TimeInterval({days:1}), new bestGlobals.TimeInterval({hours:2, minutes:30})], invalidValues:[]},
    jsonb: {validValues:[{a:'a'}, ['a', 1]], invalidValues:[]},
};

describe("td with typed-controls-direct-input", function(){
    likeAr(typesToTest).forEach(function(cases, typeName){
        describe("for type "+typeName, function(){
            var td;
            beforeEach(function(){
                td = createDirectInputTd({typeName:typeName});
            });
            afterEach(function(){
                removeTd(td);
            });
            it("is editable", function(){
                expect(td.contentEditable).to.be('true');
            });
            it("starts with null", function(){
                expect(td.getTypedValue()).to.be(null);
            });
            cases.validValues.forEach(function(value){
                it("sets and gets "+JSON.stringify(value), function(){
                    td.setTypedValue(value);
                    discrepances.showAndThrow(td.getTypedValue(), value);
                });
            });
            it("sets and gets null after a value", function(){
                td.setTypedValue(cases.validValues[0]);
                td.setTypedValue(null);
                expect(td.getTypedValue()).to.be(null);
            });
            cases.invalidValues.forEach(function(value){
                it("rejects "+JSON.stringify(value), function(){
                    td.setTypedValue(cases.validValues[0]);
                    expect(function(){
                        td.setTypedValue(value);
                    }).to.throwError();
                    discrepances.showAndThrow(td.getTypedValue(), cases.validValues[0]);
                });
            });
            it("can be disabled and enabled", function(){
                td.disable(true);
                expect(td.disabled).to.be(true);
                expect(td.contentEditable).to.be('false');
                td.disable(false);
                expect(td.disabled).to.be(false);
                expect(td.contentEditable).to.be('true');
            });
        });
    });
});

describe("editing a td with typed-controls-direct-input", function(){
    var td;
    afterEach(function(){
        removeTd(td);
    });
    it("takes what the user types when leaving the cell", function(){
        td = createDirectInputTd({typeName:'integer'});
        var counter = countUpdates(td);
        userTypes(td, '42');
        expect(td.getTypedValue()).to.be(42);
        expect(td.getAttribute('typed-controls-status')).to.be('ok');
        expect(counter.updates).to.be(1);
    });
    it("does not send update when the value does not change", function(){
        td = createDirectInputTd({typeName:'integer'});
        td.setTypedValue(42);
        var counter = countUpdates(td);
        userTypes(td, '42');
        expect(counter.updates).to.be(0);
    });
    it("marks an invalid input and does not send update", function(){
        td = createDirectInputTd({typeName:'decimal'});
        var counter = countUpdates(td);
        userTypes(td, 'abc');
        expect(td.getAttribute('typed-controls-status')).to.be('error');
        expect(counter.updates).to.be(0);
    });
    it("marks the empty cell as null", function(){
        td = createDirectInputTd({typeName:'text'});
        td.setTypedValue('hello');
        var counter = countUpdates(td);
        userTypes(td, '');
        expect(td.getAttribute('typed-controls-status')).to.be('null');
        expect(td.getTypedValue()).to.be(null);
        expect(counter.updates).to.be(1);
    });
    it("rejects the chars that the type does not accept", function(){
        td = createDirectInputTd({typeName:'integer'});
        var letter = keypressEvent('a');
        td.dispatchEvent(letter);
        expect(letter.defaultPrevented).to.be(true);
        var digit = keypressEvent('5');
        td.dispatchEvent(digit);
        expect(digit.defaultPrevented).to.be(false);
    });
    it("replaces the non breaking spaces when pasting", function(){
        td = createDirectInputTd({typeName:'text'});
        td.textContent = 'x';
        var range = document.createRange();
        range.selectNodeContents(td);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        var paste = pasteEvent('one\u00A0two');
        td.dispatchEvent(paste);
        expect(paste.defaultPrevented).to.be(true);
        expect(td.textContent).to.be('one two');
    });
});
