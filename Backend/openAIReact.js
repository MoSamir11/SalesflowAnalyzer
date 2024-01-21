let openai_subscription_key = "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"

const openai = new OpenAI({
	apiKey: openai_subscription_key,
	dangerouslyAllowBrowser: true
});

const callOpenAI = async () => {
	let system_prompt="I will tell give you some text which is an input entered by a person about his/her health condition. you will check the text and answer me in Yes/No Format. If the text is meaningful and related to any person's health condition then Yes, otherwise if the text is not making any sense and some abstract text or information is there then No."

	let messages = [
		{"role": "system", "content": system_prompt},
		{"role": "user", "content": "Your Text"},
	]

	try {
		const chatCompletion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: messages,
		});
	
		const text = chatCompletion.choices[0].message.content;
		console.log(text)
		return text;

	} catch (err) {
		console.error(err);
	}
}
