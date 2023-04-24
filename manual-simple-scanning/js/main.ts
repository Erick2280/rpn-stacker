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

        try {
            const tokens = splitInputText(inputString).map(parseToken);
            const result = calculateRpnExpression(tokens);
            presentResult(result);
            presentTokens(tokens);
        } catch (error) {
            presentErrorAlert(error.message);
        }
    });

    function resetInterface() {
        removeTokensContainer();
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

    function removeTokensContainer() {
        const tokenContainer = document.querySelector('.tokens-container');
        if (tokenContainer) tokenContainer.remove();
    }

    function presentResult(result: number) {
        resultContainer.innerText = result.toString();
        resultSection.classList.remove('hidden-element');
    }

    function createTokenElements(tokens: Token[]) {
        const tokensContainer = document.createElement('div');
        tokensContainer.classList.add('tokens-container');

        for (const token of tokens) {
            const tokenTypeToVariantName: Record<TokenType, string> = {
                [TokenType.Number]: 'primary',
                [TokenType.Plus]: 'success',
                [TokenType.Minus]: 'success',
                [TokenType.Asterisk]: 'success',
                [TokenType.Slash]: 'success',
            }
            const tokenElement = document.createElement('sl-tag');
            tokenElement.setAttribute('variant', tokenTypeToVariantName[token.type]);
            tokenElement.classList.add('token');
            tokenElement.innerText = `${token.type}: ${token.lexeme}`;
            tokensContainer.appendChild(tokenElement);
        }

        return tokensContainer;
    }

    function presentTokens(tokens: Token[]) {
        const tokensContainer = createTokenElements(tokens);
        resultSection.appendChild(tokensContainer);
    }
})()

/* DEFINIÇÃO DE TIPOS */

enum TokenType {
    Number = 'Number',
    Plus = 'Plus',
    Minus = 'Minus',
    Asterisk = 'Asterisk',
    Slash = 'Slash',
}

interface Token {
    type: TokenType;
    lexeme: string;
}

interface NumberToken extends Token {
    type: TokenType.Number;
    lexeme: string;
}

interface PlusToken extends Token {
    type: TokenType.Plus;
    lexeme: '+';
}

interface MinusToken extends Token {
    type: TokenType.Minus;
    lexeme: '-';
}

interface AsteriskToken extends Token {
    type: TokenType.Asterisk;
    lexeme: '*';
}

interface SlashToken extends Token {
    type: TokenType.Slash;
    lexeme: '/';
}

type Operator = '+' | '-' | '*' | '/';

/* FUNÇÕES DE CÁLCULO */

function splitInputText(input: string): string[] {
    return input.trim().split('\n');
}

function parseToken(lexeme: string): Token {
    if (lexeme === '+') return { type: TokenType.Plus, lexeme };
    if (lexeme === '-') return { type: TokenType.Minus, lexeme };
    if (lexeme === '*') return { type: TokenType.Asterisk, lexeme };
    if (lexeme === '/') return { type: TokenType.Slash, lexeme };
    if (isNumber(lexeme)) return { type: TokenType.Number, lexeme };
    throw new Error(`Token inválido: ${lexeme}`);
}

function calculateRpnExpression(tokens: Token[]): number {
    const stack: number[] = [];
    
    for (const token of tokens) {
        const tokenTypeToStackMutation: Record<TokenType, () => void> = {
            [TokenType.Number]: () => stack.push(Number(token.lexeme)),
            [TokenType.Plus]: () => mutateStackWithOperation(stack, '+'),
            [TokenType.Minus]: () => mutateStackWithOperation(stack, '-'),
            [TokenType.Asterisk]: () => mutateStackWithOperation(stack, '*'),
            [TokenType.Slash]: () => mutateStackWithOperation(stack, '/'),
        }

        tokenTypeToStackMutation[token.type]();
    }

    if (stack.length !== 1) throw new Error('Pilha possui mais de um elemento ao final do cálculo');

    return stack.pop();
}

function mutateStackWithOperation(stack: number[], operator: Operator) {
    const b = stack.pop();
    const a = stack.pop();

    if (a === undefined || b === undefined) throw new Error(`Pilha vazia ao tentar operar com ${operator}`);
    stack.push(operate(a, b, operator));
}

function isNumber(token: string): boolean {
    return !isNaN(Number(token));
}

function operate(a: number, b: number, operator: Operator): number {
    const operations = {
        '+': (a: number, b: number) => a + b,
        '-': (a: number, b: number) => a - b,
        '*': (a: number, b: number) => a * b,
        '/': (a: number, b: number) => a / b,
    }

    return operations[operator](a, b)
}
