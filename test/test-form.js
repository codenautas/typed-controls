"use script";

describe("forms",function(){
    var formInfo={
        fields:[
            {name: 'issue'      },
            {name: 'subject'    },
            {name: 'description'},
        ]
    }
    var medium={superId:['issues', 'new', 1], record:{}, 'new':true};
    it("render-form",function(done){
        var form=TypedControls.createForm(formInfo, medium);
        expect(form).to.be.an(TypedControls.Form);
        expect(form.medium).to.be(medium);
        form.render(document.body).then(function(){
            expect(form.dom).to.be.an(Element);
            expect(form.dom.id).to.be(JSON.stringify(medium.superId));
            expect(medium.forms).to.eql([form]);
            done();
        }).catch(done);
    });
    it("render-form twice", function(done){
        var form=TypedControls.createForm(formInfo, medium);
        form.render(document.body).then(function(){
            return form.render(document.body);
        }).then(function(){
            done();
        }).catch(done);
    });
});