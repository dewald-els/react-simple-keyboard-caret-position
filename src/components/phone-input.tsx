import { KeyboardReact as Keyboard, SimpleKeyboard } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { formatIncompletePhoneNumber } from "libphonenumber-js";

const cleanInput = (formattedInput: string) => {
	return formattedInput.replace(/[^0-9]/g, "");
};

const uncleanInput = (formattedInput: string) => {
	return formattedInput.replace(/[0-9]/g, "");
};

const findUpdateType = (prevInput: string, newInput: string) => {
	if (prevInput.length > newInput.length) {
		return UpdateType.Delete;
	} else if (newInput.length > prevInput.length) {
		return UpdateType.Insert;
	} else {
		return UpdateType.NoChange;
	}
};

const getOffset = (input: string, caret: number) => {
	const slice = input.slice(0, caret);
	const specialCharsBefore = slice.replace(/[0-9]/g, "").length;
	console.log("next char", input[caret + 1]);
	const nextCharSpecialOffset = input[caret + 1] ? uncleanInput(input[caret + 1]).length : 0;
	return nextCharSpecialOffset + specialCharsBefore;
};

enum UpdateType {
	NoChange,
	Delete,
	Insert
}

const PhoneInput = () => {

	const inputRef = useRef<HTMLInputElement | null>(null);
	const keyboardRef = useRef<SimpleKeyboard | null>(null);

	const [caret, setCaret] = useState<number>(0);
	const [currentOffset, setCurrentOffset] = useState<number>(0);

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

	const handleOnChange = (newInput: string) => {
		if (inputRef.current && keyboardRef.current) {
			const formattedInput = formatIncompletePhoneNumber(newInput, "US");
			const prevFormattedInput = inputRef.current.value;
			const prevCleanInput = cleanInput(inputRef.current.value);
			const newCleanInput = cleanInput(formattedInput);

			// Update the current input and keyboard
			inputRef.current.value = formattedInput;
			keyboardRef.current?.setInput(formattedInput, "phone");

			// Calculate caret
			const updateType: UpdateType = findUpdateType(prevCleanInput, newCleanInput);

			if (updateType === UpdateType.Insert) {
				console.log("insert");
				let potentialCaret = caret + 1;

				const prevOffset = getOffset(prevFormattedInput, caret);
				const newOffset = getOffset(formattedInput, potentialCaret);

				console.log("currentCaret", caret);
				console.log("possibleCaret", potentialCaret);
				console.log("formatted", formattedInput);
				console.log("prevOffset", prevOffset);
				console.log("newOffset", newOffset);

				potentialCaret += newOffset - prevOffset;
				if (potentialCaret === caret) { // Won't trigger the useEffect. 
					setTimeout(() => {
						keyboardRef.current?.setCaretPosition(caret);
						inputRef.current?.setSelectionRange(caret, caret);
						inputRef.current?.focus();
					}, 10);
				} else {
					setCaret(potentialCaret);
				}
			} else if (updateType === UpdateType.Delete) {
				console.log("delete");
			} else {
				console.log("no change");
			}

		}
	};

	const handleInputClick = (event: SyntheticEvent<HTMLInputElement>) => {
		setCaret(event.currentTarget.selectionEnd ?? event.currentTarget.value.length);
	};

	return (
		<>
			<div>
				<input id={"phone"} name={"phone"} placeholder={"Phone number"} ref={inputRef} onClick={handleInputClick} />
			</div>
			<Keyboard
				keyboardRef={r => keyboardRef.current = r}
				inputName={"phone"}
				onChange={handleOnChange}
				layout={{
					default: [
						"1 2 3",
						"4 5 6",
						"7 8 9",
						"{bksp} 0 {enter}",
					],
				}}
			/>
		</>
	);
};

export default PhoneInput;