let list;
let currIndex = 0;

const getFileList = async () => {
    const res = await fetch('list');
    const json = await res.json();
    console.log(json);
    list = json;
    return json;
}

const fetchImage = async (requestedPath) => {
    const encoded = encodeURIComponent(requestedPath);
    const res = await fetch(`image?path=${encoded}`);
    const arrBuff = await res.arrayBuffer();
    const imageStr = 'data:image/jpeg;base64,' + arrayBufferToBase64(arrBuff);
    $('body').append(`<img src=${imageStr}></img>`);
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    let bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));

    return window.btoa(binary);
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

const main = async () => {
    await getFileList();
    fetchImage(list[0].fullPath)

};

$(document).ready(main);
