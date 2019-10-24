const submitYtDl = async () => {
    toggleLoader(true);
    const url = $('#url-field').val();
    const format = $('#format-field').val();
    
    const data = {
        link: url,
        options: !!format ? {
            formatID: format
        } : undefined
    };
    const res = await postRequest('download', data);
    printMessage(res);
    toggleLoader(false);
};

const submitRename = async () => {
    toggleLoader(true);
    const origin = $('#rename-field').val();
    const checked = $('#execute-check').prop('checked');
    const data = {
        path: origin && origin.length > 1 ? origin : null,
        execute: checked
    };
    $('#execute-check').prop('checked', false);
    const res = await postRequest('rename', data);
    if (Array.isArray(res)) {
        const starter = '<p>Please confirm:</p>';
        printMessage(starter + res.map(item => `<div class="microlist-item">${item.name} ↣ ${item.newName}</div>`).join(''));
    } else {
        printMessage(res);
    }
    toggleLoader(false);
};

const submitMigrate = async () => {
    toggleLoader(true);
    const origin = $('#path1-field').val();
    const destination = $('#path2-field').val();
    const data = {
        origin: origin && origin.length > 1 ? origin : null,
        destination: destination && destination.length > 1 ? destination : null
    };
    const res = await postRequest('migrate', data);
    toggleLoader(false);
    printMessage(res);
};

const toggleLoader = (state) => {
    $('.loader').toggleClass('hidden', !state);
};

const printMessage = (message) => {
    $('.console').append(`<li>${typeof message === 'string' ? message : JSON.stringify(message)}</li>`);
};

const checkClipboard = async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            $('#url-field').val(text);
        }
    } catch (e) {}
};

const postRequest = async (url, params) => {
    return new Promise(async resolve => {
        const options = {
            headers: {
                'content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(params),
            method: 'post'
        };

        const res = await fetch(url, options);
        const text = await res.text();
        try {
            resolve(JSON.parse(text));
        } catch (e) {
            resolve(text);
        }
    });
};

const initWindowFuncs = () => {
    window.toggleLoader = toggleLoader;
};

const main = () => {
    initWindowFuncs();
};

// window.addEventListener('focus', () => {
//     checkClipboard();
// });

$(document).ready(main);