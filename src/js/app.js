import $ from 'jquery';
import {parseCode, parseCode_with_source, get_declaration_collection, getSymbolicSubstitution} from './code-analyzer';

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

