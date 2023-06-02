async function makeRequestQuestion(content, request, openai) {
    const GPT35TurboMessage = [
        { role: "user", content: beautifyPrompt(content, request) }
    ];
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        messages: GPT35TurboMessage
    });

    return response.data.choices[0].message.content
}

function beautifyPrompt(content, request) {
    return "Это контекст: " + content + "\n" + "Это запрос: " + request + "\n" + "Ответь на вопрос исходя из контекста."
}

module.exports = makeRequestQuestion