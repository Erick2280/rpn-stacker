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
        const inputArray = inputString.trim().split('\n');
        try {
            const result = calculateRpnExpression(inputArray);
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
/* FUNÇÕES DE CÁLCULO */
function calculateRpnExpression(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (isNumber(token)) {
            stack.push(Number(token));
        }
        else if (isOperator(token)) {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined)
                throw new Error('Expressão inválida');
            stack.push(operate(a, b, token));
        }
        else {
            throw new Error(`Token inválido: ${token}`);
        }
    }
    if (stack.length !== 1)
        throw new Error('Expressão inválida');
    return stack.pop();
}
function isNumber(token) {
    return !isNaN(Number(token));
}
function isOperator(token) {
    return ['+', '-', '*', '/'].includes(token);
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
