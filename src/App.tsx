import "./App.css";
import { KeyboardReact, SimpleKeyboard } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { CountryCode, formatIncompletePhoneNumber } from "libphonenumber-js";


type Digit = {
	value: string;
	idx: number;
	occurrence: number;
}

const isDigit = (possibleDigit: string): boolean => {
	return possibleDigit.replace(/[^0-9]/gi, "").length > 0;
};

const parseToDigits = (inputValue: string): Digit[] => {

	const occurrences: Record<string, number> = {};
	const digits: Digit[] = [];

	for (let i = 0; i < inputValue.length; i++) {
		occurrences[inputValue[i]] = occurrences[inputValue[i]] + 1 || 1;
		digits.push({
			value: inputValue[i],
			idx: i,
			occurrence: occurrences[inputValue[i]],
		});
	}

	return digits;
};

const findNewCaretPosition = (prevDigits: Digit[], newDigits: Digit[]): number | undefined => {

	const newDigitsClean = newDigits.filter(d => isDigit(d.value));
	const prevDigitsClean = prevDigits.filter(d => isDigit(d.value));

	if (newDigitsClean.length > prevDigitsClean.length) { // Adding digits
		for (let i = 0; newDigitsClean.length; i++) {
			const newDigit = newDigitsClean[i];
			const prevDigit = prevDigitsClean[i];
			if (!prevDigit) {
				return newDigit.idx + 1 > newDigits.length ? newDigits.length : newDigit.idx + 1;
			}

			if (prevDigit.value === newDigit.value && prevDigit.occurrence !== newDigit.occurrence) {
				return newDigit.idx + 1 > newDigits.length ? newDigits.length : newDigit.idx + 1;
			}

			if (prevDigit.value !== newDigit.value) {
				return newDigit.idx + 1 > newDigits.length ? newDigits.length : newDigit.idx + 1;
			}
		}
	} else {
		for (let i = 0; prevDigitsClean.length; i++) {
			const prevDigit = prevDigitsClean[i];
			const newDigit = newDigitsClean[i];

			if (!newDigit) {
				const prevNewDigit = newDigitsClean[i - 1];
				if (prevNewDigit) {
					return prevNewDigit.idx + 1;
				} else {
					return 0;
				}
			}

			// if (newDigit.value === prevDigit.value && newDigit.occurrence !== prevDigit.occurrence) {
			// TODO: Is this need for deleting?
			// }

			if (newDigit.value !== prevDigit.value) {
				const prevNewDigit = newDigitsClean[i - 1];
				if (prevNewDigit) {
					return prevNewDigit.idx + 1;
				} else {
					return 0;
				}
			}
		}
	}


};

const objectsEqual = (a: any, b: any) => {
	try {
		return JSON.stringify(a) === JSON.stringify(b);
	} catch (e) {
		console.error("Invalid objects provided to objectCompare");
	}
};

const COUNTRY_CODE: CountryCode = "US";


function App() {

	// State
	const [caret, setCaret] = useState(0);
	const [digits, setDigits] = useState<Digit[]>([]);

	// Refs
	const inputRef = useRef<HTMLInputElement | null>(null);
	const keyboardRef = useRef<SimpleKeyboard | null>(null);

	// Effects
	useEffect(() => {
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.setSelectionRange(caret, caret);
				inputRef.current.focus();
			}

			if (keyboardRef.current) {
				keyboardRef.current.setCaretPosition(caret, caret);
			}
		}, 10);
	}, [caret]);

	// Events
	const handleInputChange = (newInputValue: string) => {
		if (inputRef.current) {
			const formattedInputValue = formatIncompletePhoneNumber(newInputValue, COUNTRY_CODE);
			const newDigits = parseToDigits(formattedInputValue);
			const newDigitsClean = newDigits.filter(d => isDigit(d.value));
			const prevDigitsClean = digits.filter(d => isDigit(d.value));

			if (objectsEqual(newDigitsClean, prevDigitsClean)) {
				return;
			}

			setDigits(newDigits);
			const newCaretPosition = findNewCaretPosition(digits, newDigits) ?? caret;
			inputRef.current.value = formattedInputValue;
			keyboardRef.current?.setInput(formattedInputValue);

			if (newCaretPosition !== undefined) {
				setCaret(newCaretPosition < 0 ? 0 : newCaretPosition);
			} else {
				setCaret(newInputValue.length);
			}
		}
	};

	const handleInputClick = (event: SyntheticEvent<HTMLInputElement>) => {
		setCaret(event.currentTarget.selectionEnd ?? 0);
	};

	return (
		<>
			<input type="tel" placeholder="Tel" ref={inputRef} onClick={handleInputClick} />
			<KeyboardReact
				keyboardRef={r => keyboardRef.current = r}
				onChange={handleInputChange}
				layout={{
					default: [
						"1 2 3",
						"4 5 6",
						"7 8 9",
						"{bksp} 0 {enter}",
					],
				}} />
		</>
	);
}

export default App;
