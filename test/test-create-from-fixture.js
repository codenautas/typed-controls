"use strict";

describe("create-from-fixture",function(){
    it("create simple element", function(){
        var element = Tedede.createFromFixture({tagName:'span', attributes:{}});
        expect(element).to.eql(html.span());
        element.create();
    });
    it("create simple element with attributes", function(){
        var element = Tedede.createFromFixture({tagName:'b', attributes:{"class": "the-class"}});
        expect(element).to.eql(html.b({"class": "the-class"}));
        element.create();
    });
    it("create complex elements", function(){
        var element = Tedede.createFromFixture(
            {tagName:'i', attributes:{}, content:[
                {tagName:'span', attributes:{}},
                {tagName:'b', attributes:{"class": "the-class"}}
            ]}
        );
        expect(element).to.eql(
            html.i([
                html.span(),
                html.b({"class": "the-class"})
            ])
        );
        element.create();
    });
});
