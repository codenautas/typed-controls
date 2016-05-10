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

describe("optionsCtrl",function(){
    it.only("include more info", function(){
        var ctrl = Tedede.optionsCtrl({
            typeName: 'enum',
            options:[
                {option:1, label:'one'},
                {option:2, label:'two', more:true}
            ]
        })
        var expected = html.div({ 'tedede-option-group': 'simple-option' },[
            html.div([html.input({"type":"radio","value":1}), html.label({"for-value":1}, "one"),html.br()]),
            html.div([html.input({"type":"radio","value":2}), html.label({"for-value":2}, "two"),html.span({"class":"option-more-info"}),html.br()]),
        ]);
        console.log('---------------');
        console.log(selfExplain.assert.allDifferences(ctrl, expected));
        expect(ctrl).to.eql(expected);
        var element = ctrl.create();
        // Tedede.adaptElement
        // expect element.moreinfo[2].className==='option-more-info'
    });
});
