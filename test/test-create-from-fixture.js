"use strict";

var assert = selfExplain.assert;

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
    it("funcion Tedede.optionsCtrl",function(){
        var typeInfo={
            typeName:"enum",
            showOption: true,
            options:[
                {option: 'a', label: 'es una vocal'      },
                {option: 'b', label: 'es una consonante' },
            ]
        };
        var element=Tedede.optionsCtrl(typeInfo);
        var esperado=html.div({"tedede-option-group": 'simple-option'},[
            html.div([
                html.label({"for-value": 'a'},'a'),
                html.input({type:'radio', value:'a'}),
                html.label({"for-value": 'a'},'es una vocal')
            ]),
            html.div([
                html.label({"for-value": 'b'},'b'),
                html.input({type:'radio', value:'b'}),
                html.label({"for-value": 'b'},'es una consonante')
            ])
        ]);
        eval(assert(!assert.allDifferences(element, esperado)));
        // expect(element).to.eql(esperado)
    })
});

describe("optionsCtrl",function(){
    it("include more info", function(){
        var typeInfo={
            typeName: 'enum',
            options:[
                {option:1, label:'one'},
                {option:2, label:'two', more:true},
                {option:'ns/nc', label:'ns/nc', more:true}
            ]
        }
        var ctrl = Tedede.optionsCtrl(typeInfo);
        var expected = html.div({ 'tedede-option-group': 'simple-option' },[
            html.div([html.input({"type":"radio","value":1}), html.label({"for-value":1}, "one")]),
            html.div([html.input({"type":"radio","value":2}), html.label({"for-value":2}, "two"),html.span({"for-value":2,"class":"option-more-info"})]),
            html.div([html.input({"type":"radio","value":'ns/nc'}), html.label({"for-value":'ns/nc'}, "ns/nc"),html.span({"for-value":'ns/nc',"class":"option-more-info"})]),
        ]);
        // console.log('---------------');
        // console.log(selfExplain.assert.allDifferences(ctrl, expected));
        eval(assert(!assert.allDifferences(ctrl, expected)));
        var element = ctrl.create();
        Tedede.adaptElement(element,typeInfo);
        expect(element.moreInfo[2].className).to.eql('option-more-info');
        expect(element.moreInfo['ns/nc'].getAttribute('for-value')).to.eql('ns/nc');
    });
});
