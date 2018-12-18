import assert from 'assert';
import {parseCode, getSymbolicSubstitution} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
});

describe('The javascript SymbolicSubstitution', () => {
    it('is manages an empty code correctly', () => {
        assert.equal(
            getSymbolicSubstitution(''),
            ''
        );
    });

    it('is manages an empty function correctly', () => {
        assert.equal(
            getSymbolicSubstitution('function foo() {\n' +
                '}'),
            'function foo() {\n' +
            '}'
        );
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing example 1 correctly', () => {
        assert.equal(
            getSymbolicSubstitution('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n'),
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    } else if (x + 1 + y < z * 2) {\n' +
            '        return x + y + z + (0 + x + 5);\n' +
            '    } else {\n' +
            '        return x + y + z + (0 + z + 5);\n' +
            '    }\n' +
            '}');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            getSymbolicSubstitution('let a = 1;'),
            'let a = 1;');
    });
});


