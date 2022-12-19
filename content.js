browser.runtime.onMessage.addListener(request => {
    let response = '';

    if (request.req === 'get-source') {
        response = document.documentElement.innerText;
    }

    return Promise.resolve({content: response});
})

console.log('Running content');