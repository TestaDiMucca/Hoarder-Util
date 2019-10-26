let list;
let currIndex = 0;
let timer = 5; /* in secomds */
let interval = null;
let cache = {};

const LS_KEYS = {
    POS: 'pos'
};
const CACHE_KEEP_RANGE = 2;

const startShow = () => {
    interval = setInterval(advanceSlide, timer * 1000);
};

const clearShow = () => {
    if (interval) clearInterval(interval);
};

const advanceSlide = () => {
    currIndex++;
    loadNext();
};

const getFileList = async () => {
    const res = await fetch('list');
    const json = await res.json();
    console.log(json);
    list = json;
    return json;
}

const getSlotForIndex = (i) => {
    return `#slot-${ i % 3 }`;
};

const loadNext = () => {
    loadOne(currIndex - 1, false);
    loadOne(currIndex, true);
    loadOne(currIndex + 1, false);
    cleanCaches(currIndex);
};

const loadOne = async (i, onStage) => {
    if (!list[i]) return;

    if (i < 0) i = list.length - 1;
    if (i >= list.length) i = 0;
    const target = getSlotForIndex(i);
    const fullPath = list[i].fullPath;
    console.log('onstage: index', i, fullPath, !!cache[i]);
    $(target).toggleClass('hidden', !onStage);
    const imgStr = cache[i] ? cache[i] : await fetchImage(fullPath);
    cache[i] = imgStr;
    $(target).attr('src', imgStr);
    // $(target).toggleClass('hidden', !onStage);
};

const cleanCaches = (currentIndex) => {
    if (cache[currentIndex - CACHE_KEEP_RANGE]) delete cache[currentIndex - CACHE_KEEP_RANGE];
    if (cache[currentIndex + CACHE_KEEP_RANGE]) delete cache[currentIndex + CACHE_KEEP_RANGE];
};

const fetchImage = async (requestedPath) => {
    const encoded = encodeURIComponent(requestedPath);
    const res = await fetch(`image?path=${encoded}`);
    const arrBuff = await res.arrayBuffer();
    const imageStr = 'data:image/jpeg;base64,' + arrayBufferToBase64(arrBuff);
    return imageStr;
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

window.onbeforeunload = () => {
    localStorage.setItem(LS_KEYS.POS, currIndex);
};

const checkIndex = () => {
    const lIndex = localStorage.getItem(LS_KEYS.POS);
    if (lIndex !== undefined) {
        currIndex = lIndex;
    }
};

const main = async () => {
    await getFileList();
    checkIndex();
    // fetchImage(list[0].fullPath);
    loadNext();
    startShow();
};

$(document).ready(main);
