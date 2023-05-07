import "./App.css";
import PhoneInput from "./components/phone-input";

const App = () => {
	const handlePhoneNumberChange = (phoneNumber: string) => {
		console.log("number changed to: ", phoneNumber);
	};
	return (
		<div>
			<h1>Phone</h1>
			<PhoneInput onChange={handlePhoneNumberChange} />
		</div>
	);
};

export default App;