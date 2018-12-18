import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as estraverse from 'estraverse';
import * as staticeval from 'static-eval';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse/*, {range: true}*/);
};
const varCollector = {
    'VariableDeclarator': collectVariableDeclarator,
    'AssignmentExpression': collectAssignmentExpression,
};

const varRemover = {
    'BlockStatement': remove_fromBlockStatement,
};

function collectVars(node) {
    return varCollector[node.type](node);
}

function includes_except_assignment_expression(x, except) {
    return /*(x.type === 'AssignmentExpression' && except.includes(x.left.txt)) ||*/(x.type === 'ExpressionStatement' && x.expression.type === 'AssignmentExpression' && except.includes(x.expression.left.txt));
}

function is_assignment(except) {
    return x => includes_except_assignment_expression(x, except) ||
        (!['VariableDeclaration', 'AssignmentExpression'].includes(x.type)
            &&
            (!(x.type == 'ExpressionStatement' && ['VariableDeclaration', 'AssignmentExpression'].includes(x.expression.type))));
}

function remove_fromBlockStatement(node, except) {
    node.body = node.body.filter(is_assignment(except));
}

function collectVariableDeclarator(node) {
    return node.init;
}

function collectAssignmentExpression(node) {
    return node.right;
}

const parseCode_with_source = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true, range: true}, node => node.txt =
        codeToParse.substring(node.range[0], node.range[1]));
};

function createsNewScope(node) {
    return node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'BlockStatement' ||
        node.type === 'Program';
}

const scopeChain = [];

function isDecelerator(node) {
    return node.type === 'VariableDeclarator' || node.type === 'AssignmentExpression';
}

function saveVarsInScope(node) {
    let id = node.id ? node.id.txt : node.left.txt;
    var currentScope = scopeChain[scopeChain.length - 1];
    var res = collectVars(node);
    currentScope[id] = res;
}

function get_value_from_scope(node) {
    for (let i = /*node.txt === id ? scopeChain.length - 2 :*/ scopeChain.length - 1; i > -1; i--) {
        if (scopeChain[i][node.txt]) {
            return scopeChain[i][node.txt];
        }
    }
    // return node;
}

function handleNewScope(node) {
    scopeChain.push({});
    if (node.type === 'FunctionDeclaration') {
        params = node.params.map(x => x.txt).concat(Object.keys(scopeChain[0]));
        node.params.forEach(x => scopeChain[scopeChain.length - 1][x.txt] = x);
    }
}

function should_change_var(node, parent) {
    return (node.type === 'Identifier') &&
        !((parent.type === 'AssignmentExpression' && parent.left.txt === node.txt) || (parent.type === 'VariableDeclarator'
            && parent.id.txt === node.txt));
}

function enter(node, parent) {
    if (createsNewScope(node)) {
        handleNewScope(node);
    }
    else if (should_change_var(node, parent))
        return get_value_from_scope(node);
}

function leave(node) {
    if (isDecelerator(node))
        saveVarsInScope(node);
    varRemover[node.type] ? varRemover[node.type](node, params) : null;
    if (createsNewScope(node)) {
        scopeChain.pop();
        if (node.type === 'FunctionDeclaration')
            params = [];
    }
}

var params = [];
const getSymbolicSubstitution = (codeToParse) => {
    let res = parseCode_with_source(codeToParse);
    estraverse.replace(res, {
        enter: enter,
        leave: leave
    });
    res = escodegen.generate(res);
    return res;
};

function should_eval_if_test(node,parent) {
    return node.type === 'IfStatement' && !(parent.type === 'IfStatement' && parent.alternate==node && parent.dit);
}

function evalAst(code, inputVector) {
    let toColor=[];
    estraverse.replace(parseCode_with_source(code), {
        enter: function (node, parent) {
            if (should_eval_if_test(node, parent)) {
                if (staticeval(node.test, inputVector)){
                    node.dit = true;
                    toColor.push([node.test.range[0],node.test.range[1],true]);
                }
                else{
                    toColor.push([node.test.range[0],node.test.range[1], false]);
                    node.consequent = {};
                }
            }
        }
    }
    );
    return toColor;
}

export {parseCode, parseCode_with_source, evalAst, getSymbolicSubstitution};
