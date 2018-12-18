import $ from 'jquery';
import {parseCode, parseCode_with_source, evalAst, getSymbolicSubstitution} from './code-analyzer';
let ast =null;
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});

$(document).ready(function () {
    $('#codeSymbolicSubstitution').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = getSymbolicSubstitution(codeToParse);
        $('#parsedCode').val(parsedCode);
    });
});

$(document).ready(function () {
    let start_mark_red = '<mark style="background-color: red">',
        start_mark_green = '<mark style="background-color: green">',
        end_mark = '</mark>';
    $('#codeEval').click(() => {
        let codeToParse = $('#inputVector').val();
        let parsedCode = $('#parsedCode').val();
        console.log(parsedCode);
        let inputVector = JSON.parse(codeToParse);
        let colorIndexs = evalAst(parseCode_with_source(parsedCode), inputVector);
        let added = 0;
        colorIndexs.map((lex)=>{
            let start_mark =lex[2]?start_mark_green:start_mark_red;
            console.log(start_mark);
            parsedCode = parsedCode.slice(0, lex[0]+added) + start_mark + parsedCode.slice(lex[0]+added, lex[1]+added) + end_mark + parsedCode.slice(lex[1]+added);
            added = added + start_mark.length + end_mark.length;
        });
        console.log(parsedCode);
        // parsedCode = parsedCode.split('{').join('{\n')
        document.getElementById("outputText").innerHTML = '<pre>'+parsedCode+'</pre>';
    });
});

