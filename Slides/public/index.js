let list;
let shuffledList;
let currIndex = 0;
let timer = 5; /* in secomds */
let interval = null;
let cache = {};
let shuffle = false;
let optionsOpen = false;

let nosleep = new NoSleep();

const LS_KEYS = {
    POS: 'pos'
};
const CACHE_KEEP_RANGE = 2;

const toggleShuffle = () => {
    shuffle = !shuffle;
    Object.keys(cache).forEach(key => delete cache[key]);
};

const shuffleList = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
};

const startShow = () => {
    console.log('startShow');
    interval = setInterval(advanceSlide, timer * 1000);
    nosleep.enable();
};

const clearShow = () => {
    if (interval) clearInterval(interval);
    nosleep.disable();
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
    shuffledList = shuffleList(list.slice(0));
    console.log(shuffledList);
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
    const useList = shuffle ? shuffledList : list;
    if (!useList[i]) return;

    if (i < 0) i = useList.length - 1;
    if (i >= useList.length) i = 0;
    const target = getSlotForIndex(i);
    const fullPath = useList[i].fullPath;
    console.log('onstage: index', i, fullPath, !!cache[i]);
    $(target).toggleClass('hidden', !onStage);
    const imgStr = cache[i] ? cache[i] : await fetchImage(fullPath);
    cache[i] = imgStr;
    $(target).attr('src', imgStr);
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

const handleClick = () => {
    if (optionsOpen) return;
    setTimeout(() => {
        const useList = shuffle ? shuffledList : list;
        $('#filename').text(useList[currIndex].fullPath);
        clearShow();
        $('.toolbar').toggleClass('hidden', false);
        optionsOpen = true;
    }, 10);
};

const closeOptions = () => {
    optionsOpen = false;
    $('.toolbar').toggleClass('hidden', true);
    startShow();
};

const handleFullscreen = () => {
    const element = document.body;
    const doc = document;

    if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement
    ) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Elem.ALLOW_KEYBOARD_INPUT);
        }

        element.style.width = '100%';
        element.style.height = '100%';
    } else {
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
        }
    }
};

const exitFullscreen = () => {
    if (doc.exitFullscreen) {
        doc.exitFullscreen();
    } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
    } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
    }
};

const checkIndex = () => {
    const lIndex = localStorage.getItem(LS_KEYS.POS);
    if (lIndex !== undefined) {
        currIndex = lIndex;
    }
};

const addListeners = () => {
    window.onbeforeunload = () => {
        localStorage.setItem(LS_KEYS.POS, currIndex);
    };

    let specifiedElement = document.querySelector('.toolbar');
    document.addEventListener('click', (event) => {
        var isClickInside = specifiedElement.contains(event.target);

        if (!isClickInside && optionsOpen) {
            console.log('closing click outside')
            //the click was outside the specifiedElement, do something
            closeOptions();
        }
    });
};

const main = async () => {
    await getFileList();
    checkIndex();
    addListeners();
    // fetchImage(list[0].fullPath);
    loadNext();
    startShow();
};

$(document).ready(main);
