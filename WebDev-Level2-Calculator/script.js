// Calculator state machine: holds the two operands and the pending operator,
// then renders them into the two display elements. No eval() is used.

class Calculator {
    // Wire up the two display lines, then start from a clean state.
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    // Reset to power-on state: "0" on screen, nothing pending.
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    // Drop the last typed character; fall back to "0" if nothing is left.
    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    // Add a digit. Replaces the leading "0" so "0" + "5" becomes "5", not "05".
    appendNumber(number) {
        if (this.currentOperand === '0') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    // Add a decimal point, at most one per number.
    appendDecimal() {
        if (this.currentOperand.includes('.')) return;
        this.currentOperand = this.currentOperand.toString() + '.';
    }

    // Store an operator. If one is already pending, fold it first
    // so "5 + 3 ×" evaluates 5+3 before starting the × step (chaining).
    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    // Run previousOperand (operation) currentOperand and show the answer.
    // Division by zero shows an error instead of Infinity/crashing.
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = 'Error: Div by 0';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    // Push the current state into the DOM: big line = typed number,
    // small line = pending expression like "5 +".
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Grab every control by id (no inline onclick attributes anywhere).
const numberButtons = document.querySelectorAll('button[id^="digit-"]');
const operationButtons = document.querySelectorAll('#add, #subtract, #multiply, #divide');
const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('clear');
const deleteButton = document.getElementById('delete');
const decimalButton = document.getElementById('decimal');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Digits: the digit is encoded in the button id ("digit-7" -> "7").
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        const digit = button.id.replace('digit-', '');
        calculator.appendNumber(digit);
        calculator.updateDisplay();
    });
});

// Operators: the symbol is the button text (+ − × ÷), matching the switch above.
operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        const op = button.innerText;
        calculator.chooseOperation(op);
        calculator.updateDisplay();
    });
});

// Equals: evaluate the pending expression.
equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// AC: full reset.
clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// DEL: erase one character.
deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Decimal point.
decimalButton.addEventListener('click', () => {
    calculator.appendDecimal();
    calculator.updateDisplay();
});
