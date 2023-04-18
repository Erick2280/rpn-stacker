/* FUNÇÕES DA INTERFACE */
(() => {
    const rpnExpressionInput = document.getElementById('rpn-expression-input');
    const rpnExpressionFileInput = document.getElementById('rpn-expression-file-input');
    const rpnCalculateButton = document.getElementById('rpn-calculate-button');
    const resultSection = document.getElementById('result-section');
    const resultContainer = document.getElementById('result-container');
    const errorAlert = document.getElementById('error-alert');
    const errorAlertMessageContainer = document.getElementById('error-alert-message-container');
    rpnExpressionInput.addEventListener('sl-change', (event) => {
        if (event.target.value === '') {
            rpnCalculateButton.setAttribute('disabled', 'true');
        }
        else {
            rpnCalculateButton.removeAttribute('disabled');
        }
    });
    rpnExpressionFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const fileContent = event.target.result;
            rpnExpressionInput.value = fileContent;
            rpnCalculateButton.removeAttribute('disabled');
        };
        fileReader.readAsText(file);
    });
    rpnCalculateButton.addEventListener('click', () => {
        resetInterface();
        const inputString = rpnExpressionInput.value;
        const tokens = splitInputText(inputString).map(parseToken);
        try {
            const result = calculateRpnExpression(tokens);
            presentResult(result);
        }
        catch (error) {
            presentErrorAlert(error.message);
        }
    });
    function resetInterface() {
        hideResultSection();
        dismissErrorAlert();
    }
    function presentErrorAlert(message) {
        errorAlertMessageContainer.innerText = message;
        errorAlert.classList.remove('hidden-element');
    }
    function dismissErrorAlert() {
        errorAlert.classList.add('hidden-element');
    }
    function hideResultSection() {
        resultSection.classList.add('hidden-element');
    }
    function presentResult(result) {
        resultContainer.innerText = result.toString();
        resultSection.classList.remove('hidden-element');
    }
})();
/* DEFINIÇÃO DE TIPOS */
var TokenType;
(function (TokenType) {
    TokenType["Number"] = "Number";
    TokenType["Plus"] = "Plus";
    TokenType["Minus"] = "Minus";
    TokenType["Asterisk"] = "Asterisk";
    TokenType["Slash"] = "Slash";
})(TokenType || (TokenType = {}));
/* FUNÇÕES DE CÁLCULO */
function splitInputText(input) {
    return input.trim().split('\n');
}
function parseToken(lexeme) {
    if (lexeme === '+')
        return { type: TokenType.Plus, lexeme };
    if (lexeme === '-')
        return { type: TokenType.Minus, lexeme };
    if (lexeme === '*')
        return { type: TokenType.Asterisk, lexeme };
    if (lexeme === '/')
        return { type: TokenType.Slash, lexeme };
    if (isNumber(lexeme))
        return { type: TokenType.Number, lexeme };
    throw new Error(`Token inválido: ${lexeme}`);
}
function calculateRpnExpression(tokens) {
    const stack = [];
    for (const token of tokens) {
        const tokenTypeToStackMutation = {
            [TokenType.Number]: () => stack.push(Number(token.lexeme)),
            [TokenType.Plus]: () => mutateStackWithOperation(stack, '+'),
            [TokenType.Minus]: () => mutateStackWithOperation(stack, '-'),
            [TokenType.Asterisk]: () => mutateStackWithOperation(stack, '*'),
            [TokenType.Slash]: () => mutateStackWithOperation(stack, '/'),
        };
        tokenTypeToStackMutation[token.type]();
    }
    if (stack.length !== 1)
        throw new Error('Pilha não possui apenas um elemento ao final do cálculo');
    return stack.pop();
}
function mutateStackWithOperation(stack, operator) {
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined)
        throw new Error(`Pilha vazia ao tentar operar com ${operator}`);
    stack.push(operate(a, b, operator));
}
function isNumber(token) {
    return !isNaN(Number(token));
}
function operate(a, b, operator) {
    const operations = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
    };
    return operations[operator](a, b);
}
//# sourceMappingURL=main.js.map