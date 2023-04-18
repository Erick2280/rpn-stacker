/* FUNÇÕES DA INTERFACE */

(() => {
    const rpnExpressionInput: HTMLElement = document.getElementById('rpn-expression-input');
    const rpnExpressionFileInput: HTMLElement = document.getElementById('rpn-expression-file-input');
    const rpnCalculateButton: HTMLElement = document.getElementById('rpn-calculate-button');
    const resultSection: HTMLElement = document.getElementById('result-section');
    const resultContainer: HTMLElement = document.getElementById('result-container');
    const errorAlert: HTMLElement = document.getElementById('error-alert');
    const errorAlertMessageContainer: HTMLElement = document.getElementById('error-alert-message-container');

    rpnExpressionInput.addEventListener('sl-change', (event: InputEvent) => {
        if ((event.target as unknown as Record<string, string>).value === '') {
            rpnCalculateButton.setAttribute('disabled', 'true');
        } else {
            rpnCalculateButton.removeAttribute('disabled');
        }
    });

    rpnExpressionFileInput.addEventListener('change', (event: InputEvent) => {
        const file = (event.target as unknown as Record<string, File>).files[0];
        const fileReader = new FileReader();

        fileReader.onload = (event: ProgressEvent<FileReader>) => {
            const fileContent = (event.target as unknown as Record<string, string>).result;
            (rpnExpressionInput as unknown as HTMLTextAreaElement).value = fileContent;
            rpnCalculateButton.removeAttribute('disabled');
        }

        fileReader.readAsText(file);
    });

    rpnCalculateButton.addEventListener('click', () => {
        resetInterface();

        const inputString = (rpnExpressionInput as unknown as HTMLTextAreaElement).value;
        const inputArray = inputString.trim().split('\n');

        try {
            const result = calculateRpnExpression(inputArray);
            presentResult(result);
        } catch (error) {
            presentErrorAlert(error.message);
        }
    });

    function resetInterface() {
        hideResultSection();
        dismissErrorAlert();
    }

    function presentErrorAlert(message: string) {
        errorAlertMessageContainer.innerText = message;
        errorAlert.classList.remove('hidden-element');
    }

    function dismissErrorAlert() {
        errorAlert.classList.add('hidden-element');
    }

    function hideResultSection() {
        resultSection.classList.add('hidden-element');
    }

    function presentResult(result: number) {
        resultContainer.innerText = result.toString();
        resultSection.classList.remove('hidden-element');
    }
})()

/* FUNÇÕES DE CÁLCULO */

function calculateRpnExpression(tokens: string[]): number {
    const stack: number[] = [];
    for (const token of tokens) {
        if (isNumber(token)) {
            stack.push(Number(token));
        } else if (isOperator(token)) {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined) throw new Error('Expressão inválida');
            stack.push(operate(a, b, token));
        } else {
            throw new Error(`Token inválido: ${token}`);
        }
    }

    if (stack.length !== 1) throw new Error('Expressão inválida');

    return stack.pop();
}

function isNumber(token: string): boolean {
    return !isNaN(Number(token));
}

function isOperator(token: string): token is '+' | '-' | '*' | '/' {
    return ['+', '-', '*', '/'].includes(token);
}

function operate(a: number, b: number, operator: '+' | '-' | '*' | '/'): number {
    const operations = {
        '+': (a: number, b: number) => a + b,
        '-': (a: number, b: number) => a - b,
        '*': (a: number, b: number) => a * b,
        '/': (a: number, b: number) => a / b,
    }

    return operations[operator](a, b)
}
