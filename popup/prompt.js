let submitButton = document.querySelector('.run');

let response = document.querySelector('.response');

console.log('Running');

const createCompletePrompot = (tabContent, prompt) => {
    const completePrompt = `
    ${tabContent}
    ----------
    You are GPA, a productivity assistant with access to the user's browser tabs.
    You can read the content of the active tab and use it to generate a response.
    The tabs content is available to you above (using window.body.innerText for the content, so it includes extraneous text from web interfaces).
    You cannot perform any action on your own. Use the data available in the tabs (if any) to generate a response to the prompt below.
    User prompt: ${prompt}
    Response:`;

    return completePrompt;
};

const runCompletion = async (prompt, apiKey) => {
    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            temperature: 0,
            max_tokens: 100,
        }),
    });
    console.log(response);

    // Get completion from response
    const resBody = await response.json();
    const completion = resBody.choices[0].text.trim();
    return completion;
};

const saveAPIKey = async (apiKey) => {
    // Save API key to storage
    await browser.storage.local.set({apiKey: apiKey});
};

const getAPIKey = async () => {
    // Get API key from storage
    const response = await browser.storage.local.get('apiKey');
    console.log(response);
    return response.apiKey;
};

submitButton.onclick = async () => {
    await saveAPIKey('<API_KEY>');

    const apiKey = await getAPIKey();
    console.log(apiKey);

    // Get prompt from text input
    const prompt = document.querySelector('.prompt').value;

    // Get content of active tab
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    const tabResponse = await browser.tabs.sendMessage(tabs[0].id, {req: 'get-source'});
    const tabContent = tabResponse.content;
    // const tabContent = 'RLHF stands for "Real Life Human Friends".';

    // Run GPT completion request
    const completePrompt = createCompletePrompot(tabContent, prompt);
    // response.innerHTML = completePrompt;
    const completion = await runCompletion(completePrompt, apiKey, tabContent);
    response.innerHTML = completion;
};