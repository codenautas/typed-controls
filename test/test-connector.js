"use script";

describe("connector",function(){
    describe("plain text conection without empty strings",function(){
        var inputElement;
        var almacen;
        beforeEach(function(done){
            inputElement = html.input().create();
            almacen={ field1: 'one', field2: 'two', the_field: 'the value' };
            done();
        });
        it("connects the input element with the almacen and populate",function(){
            Tedede.connect({
                input:inputElement,
                almacen:almacen,
                field:'the_field',
                type:'text_no_empty',
            });
            expect(inputElement.value).to.be('the value');
        });
        it("connects the input element with the almacen and populate null",function(){
            almacen.the_field = null;
            Tedede.connect({
                input:inputElement,
                almacen:almacen,
                field:'the_field',
                type:'text_no_empty',
            });
            expect(inputElement.value).to.be('');
        });
    });
});