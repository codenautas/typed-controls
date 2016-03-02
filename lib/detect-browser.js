"use strict";

function parseAgent(userAgent){
    var agentInfo=new UserAgent().parse(userAgent);
    var phantom = userAgent.match(/PhantomJS\/[0-9.]+/);
    if(phantom){
        agentInfo.brief=phantom[0].replace('/',' ');
    }else{
        agentInfo.brief=agentInfo.browser+' '+agentInfo.version;
    }
    return agentInfo;
}

var agentInfo=parseAgent(window.navigator.userAgent);

function NOT_SUPPORTED_SITUATION(situation){
    if(!('when' in situation)){
        situation.when = 'allways';
    }
    if(!('must' in situation)){
        throw new Error('must include "must" clausule in definition of situation');
    }
    if(!('excluding' in situation)){
        throw new Error('must include "excluding" clausule in definition of situation');
    }
    var fail = situation.when && !situation.must;
    var isInList = situation.excluding.indexOf(agentInfo.brief)>=0;
    if(fail){
        if(!isInList){
            console.log('NOT_SUPPORTED!!!!!');
            console.log(situation.description,'in',agentInfo.brief);
            console.log('NOT CONTEMPLED!!!!!');
            if(situation.context){
                if(situation.context instanceof Error){
                    console.log(situation.context.stack)
                }else if(typeof situation.context !== "object"){
                    console.log(situation.context);
                    console.log('typeof situation.context', typeof situation.context);
                }
            }
            throw new Error('NOT_SUPPORTED NOT_CONTEMPLED');
        }
    }else if(situation.when){
        if(isInList){
            console.log(situation.description,'in',agentInfo.brief);
            console.log('¡¡¡¡¡¡¡¡¡NOW SUPPORTED!!!!!!!!');
            throw new Error('SUPPORTED NOT_CONTEMPLED');
        }
    }
    return fail;
}
