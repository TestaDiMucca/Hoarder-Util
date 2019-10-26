let list;
let shuffledList;
let currIndex = 0;
let timer = 5; /* in secomds */
let interval = null;
let cache = {};
let shuffle = true;
let optionsOpen = false;

const nosleep = new NoSleep();

/** Localstorage cache items */
const LS_KEYS = {
    POS: 'pos',
    TIMER: 'timer'
};
const CACHE_KEEP_RANGE = 2;
const MIN_TIME = 3;

const reset = async () => {
    currIndex = 0;
    clearCache();
    main();
}

const toggleShuffle = () => {
    shuffle = !shuffle;
    $('#shuffle-option').toggleClass('active', shuffle);
    clearCache();
    loadNext(true);
};

const clearCache = () => {
    Object.keys(cache).forEach(key => {
        delete cache[key];
    });
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
    $('.play-pause').text('pause');
    interval = setInterval(advanceSlide, (Math.max(timer, MIN_TIME)) * 1000);
    nosleep.enable();
};

const clearShow = () => {
    if (interval) clearInterval(interval);
    interval = null;
    $('.play-pause').text('play_arrow');
    nosleep.disable();
};

const advanceSlide = () => {
    currIndex++;
    if (currIndex >= list.length) currIndex = 0;
    loadNext();
};

const backSlide = () => {
    currIndex--;
    if (currIndex < 0) currIndex = list.length - 1;
    loadNext();
}

const handlePlayPause = () => {
    if (interval) {
        clearShow();
    } else {
        startShow();
    }
};

/**
 * Fetch the file list
 */
const getFileList = async () => {
    const res = await fetch('list');
    const json = await res.json();
    list = json;
    shuffledList = shuffleList(list.slice(0));
    return json;
}

const getSlotForIndex = (i) => {
    return `#slot-${ i % 3 }`;
};

/**
 * Actual fnc to load the images and manage the cache
 * @param {boolean} skipCurrent 
 */
const loadNext = (skipCurrent = false) => {
    loadOne(currIndex - 1, false, skipCurrent);
    loadOne(currIndex, true, skipCurrent);
    loadOne(currIndex + 1, false, skipCurrent);
    cleanCaches(+currIndex);
};

const loadOne = async (i, onStage, shouldWipe = false) => {
    const useList = shuffle ? shuffledList : list;
    if (!useList[i]) return;
    if (i < 0) i = useList.length - 1;
    if (i >= useList.length) i = 0;
    const target = getSlotForIndex(i);
    if (shouldWipe) $(target).attr('src', null);
    const fullPath = useList[i].fullPath;
    // console.log('onstage: index', i, fullPath, !!cache[i]);
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

const adjustInterval = () => {
    const timerTemp = $('#interval-field').val();
    if (timerTemp < MIN_TIME) {
        timer = MIN_TIME;
        $('#interval-field').val(MIN_TIME);
    } else {
        timer = timerTemp;
    }
};

const handleOpenOptions = () => {
    if (optionsOpen) return;
    setTimeout(() => {
        $('.viewer-area').toggleClass('blur', true);
        const useList = shuffle ? shuffledList : list;
        $('#filename').text(useList[currIndex].fullPath);
        $('#interval-field').val(timer);
        clearShow();
        $('.toolbar').toggleClass('hidden', false);
        optionsOpen = true;
    }, 10);
};

const closeOptions = () => {
    optionsOpen = false;
    $('.viewer-area').toggleClass('blur', false);
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

/**
 * Check if a cached index lists
 */
const checkIndex = () => {
    const lIndex = localStorage.getItem(LS_KEYS.POS);
    if (lIndex !== undefined) {
        currIndex = +lIndex;
    }
    const lTimer = localStorage.getItem(LS_KEYS.TIMER);
    if (lTimer !== undefined) {
        timer = Math.max(lTimer, 3);
    }
};

const addListeners = () => {
    window.onbeforeunload = () => {
        localStorage.setItem(LS_KEYS.POS, currIndex);
        localStorage.setItem(LS_KEYS.TIMER, timer);
    };

    let specifiedElement = document.querySelector('.toolbar');
    document.addEventListener('click', (event) => {
        let isClickInside = specifiedElement.contains(event.target);

        if (!isClickInside && optionsOpen) {
            closeOptions();
        }
    });

    $('.control-bar').hover(
        () => $('.control-bar').toggleClass('control-bar-hover', true),
        () => $('.control-bar').toggleClass('control-bar-hover', false)
    );

    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        const key = e.key;
        switch (key) {
            case 'ArrowLeft':
                return backSlide();
            case 'ArrowRight':
                return advanceSlide();
        }
    });
};
                          
const main = async () => {
    await getFileList();
    checkIndex();
    $('#shuffle-option').toggleClass('active', shuffle);
    addListeners();
    loadNext();
    startShow();
};

$(document).ready(main);
