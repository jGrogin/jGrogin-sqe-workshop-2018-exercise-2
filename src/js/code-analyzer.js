import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as estraverse from 'estraverse';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {range: true});
};
let collection = {}, scope = [];
const varCollector = {
    'VariableDeclarator': collectVariableDeclarator,
    'AssignmentExpression': collectAssignmentExpression,
};
const varReplacer = {
    'BinaryExpression': replaceBinaryExpression,
};
const varRemover = {
    'ExpressionStatement': remove_fromExpressionStatement,
    'BlockStatement': remove_fromBlockStatement,
};
const scoper = {
    'BlockStatement': scope_fromBlockStatement
};

function collectVars(node) {
    return varCollector[node.type] ? varCollector[node.type](node) : /*varReplacer[node.type] ? varReplacer[node.type](node) :*/ null;
}

function remove_fromExpressionStatement(node) {
}

function is_assignment(except = []) {
    return x => (x.type==='AssignmentExpression' && except.includes(x.left.txt))||
        (x.type==='ExpressionStatement'&&x.expression.type==='AssignmentExpression' && except.includes(x.expression.left.txt))||
        (!['VariableDeclaration', 'AssignmentExpression'].includes(x.type)
        &&
        (!(x.type == 'ExpressionStatement' && ['VariableDeclaration', 'AssignmentExpression'].includes(x.expression.type))));
}

function remove_fromBlockStatement(node, except = []) {
    node.body = node.body.filter(is_assignment(except));
}

function scope_fromBlockStatement(node) {
    scope.push(node.range);
    for (var x in collection)
        console.log(x);
}

function replaceBinaryExpression(node) {
    node.left = node.left.type == 'Identifier' && collection[node.left.txt] != null ? getReplacement(node.left) : node.left;
    node.right = node.right.type == 'Identifier' && collection[node.right.txt] != null ? getReplacement(node.right) : node.right;

}

function get_scope(k0, k1) {
    let min0 = 0, min1 = k1;
    scope.forEach(x => {
        min0 = x[0] > min0 & x[0] < k0 ? x[0] : min0;
        min1 = x[1] < min1 & x[1] > k1 ? x[0] : min1;
    });
    if (min0 == 0 & min1 == k1)
        return null;
    return [min0, min1];
}

function in_same_scope(k0, k1, r0, r1) {
    let k = get_scope(k0, k1), r = get_scope(r0, r1);
    if (k == null | r == null)
        return true;
    if ((k[0] < r[1] & k[1] < r[1] & k[0] > r[0] & k[1] > r[1]) | (r[0] < k[1] & r[1] < k[1] & r[0] > k[0] & r[1] > k[1]))
        return true;
    return false;
}

function getReplacementHelper(node, r0, r1, id0, id1) {
    for (var key in collection[node.txt]) {
        let k0 = Number(key.split(',')[0]), k1 = Number(key.split(',')[1]);
        // if (in_same_scope(k0, k1, r0, r1)) {
        id0 = r0 > k0 & id0 < k0 ? k0 : id0;
        id1 = r1 > k1 & id1 < k1 ? k1 : id1;
        // }
    }
    return {id0, id1};
}

function getReplacement(node) {
    let id0 = 0, id1 = 0;
    let r0 = node.range[0], r1 = node.range[1];
    const __ret = getReplacementHelper(node, r0, r1, id0, id1);
    id0 = __ret.id0;
    id1 = __ret.id1;
    return id0 != 0 ? collection[node.txt][[id0, id1]] : node;
}

function collectVariableDeclarator(node) {
    return node.init;
    // collection[node.id.txt] ? collection[node.id.txt][node.range] = node.init :
    //     collection[node.id.txt] = {[node.range]: node.init};
}

function collectAssignmentExpression(node) {
    return node.right;
    // collection[node.left.txt] ? collection[node.left.txt][node.range] = node.right :
    //     collection[node.left.txt] = {[node.range]: node.right};
}

const parseCode_with_source = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true, range: true}, node => node.txt =
        codeToParse.substring(node.range[0], node.range[1]));
};

const get_declaration_collection = (codeToParse) => {
    esprima.parseScript(codeToParse, {loc: true, range: true}, node => {
        node.txt =
            codeToParse.substring(node.range[0], node.range[1]);
        collectVars(node);

    });
    let c = collection;
    collection = [];
    console.log(c);
    return c;
};

function createsNewScope(node) {
    return node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'BlockStatement' ||
        node.type === 'Program';
}

const scopeChain = [];
const getSymbolicSubstitution = (codeToParse) => {
    let res = esprima.parseScript(codeToParse, {loc: true, range: true}, node => {
        node.txt =
            codeToParse.substring(node.range[0], node.range[1]);
        // collectVars(node);
        // varRemover[node.type] ? varRemover[node.type](node) : null;


    });
    var id = null;
    var params = null;
    estraverse.traverse(res, {
        enter: function (node, parent) {
            if (createsNewScope(node)) {
                scopeChain.push({});
                if(node.type === 'FunctionDeclaration')
                    params = node.params.map(x=>x.left?x.left.txt:x.txt);
            } else if (node.type === 'VariableDeclarator' || node.type === 'AssignmentExpression') {
                id = node.id ? node.id.txt : node.left.txt;
                var currentScope = scopeChain[scopeChain.length - 1];
                var res = collectVars(node);
                currentScope[id] = res;
            }
            else if (node.type === 'Identifier') {
                for (let i = node.txt===id?scopeChain.length - 2:scopeChain.length - 1; i > -1; i--) {
                    if (scopeChain[i][node.txt])
                    {
                        if(parent.type === 'BinaryExpression')
                        {
                            parent.left = parent.left.txt===node.txt?scopeChain[i][node.txt]:parent.left;
                            parent.right = parent.right.txt===node.txt?scopeChain[i][node.txt]:parent.right;
                        }
                        return scopeChain[i][node.txt];
                    }
                }
            }
        },
        leave: function (node) {
            if (node.type === 'VariableDeclarator' || node.type === 'AssignmentExpression')
                id = null;
            varRemover[node.type] ? varRemover[node.type](node, params) : null;
            if (createsNewScope(node)) {
                scopeChain.pop();
                if (node.type === 'FunctionDeclaration')
                    params = [];
            }
        }
    });
    console.log(scopeChain);
    console.log(res);
    res = escodegen.generate(res);
    console.log(res);
    return res;
};
export {parseCode, parseCode_with_source, get_declaration_collection, getSymbolicSubstitution};
