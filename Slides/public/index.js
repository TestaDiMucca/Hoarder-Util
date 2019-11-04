/**
 * @file Main behaviours for the slideshow page. Handle most elements
 */

/* For caching the lists */
let list;
let shuffledList;

/* State */
let interval = null;
/* Cache images */
let cache = {};
/* Star images */
let starred = {};
let playCache;
let map;

let state = {
    currIndex: 0,
    timer: 5,
    shuffle: true,
    optionsOpen: false,
    panelOpen: false,
    filepathActive: false,
    playing: true,
    favsOpen: false,
    actionDisabled: false
};

/* Hide mouse variables */
let idleTimer;
let forceHide = false;

const nosleep = new NoSleep();

/** Localstorage cache items */
const LS_KEYS = {
    POS: 'pos',
    TIMER: 'timer',
    SHOW_NAME: 'showName',
    FAVS: 'favs'
};
const CACHE_KEEP_RANGE = 3;
const MIN_TIME = 3;
const BAR_HOVER_TIME = 1000;

const LOADER_IMG = '<img class="loader info-loader" src="img/loading.svg" />';
const CLOCK_IMG = '<img class="paused-bit" src="img/clock.svg" />'

const reset = async () => {
    state.currIndex = 0;
    clearCache();
    main();
}

const toggleShuffle = () => {
    state.shuffle = !state.shuffle;
    $('#shuffle-option').toggleClass('active', state.shuffle);
    clearCache();
    loadNext(true);
};

const toggleBottomName = () => {
    const active = $('#filepath-toggle').prop('checked');
    state.filepathActive = active;
    if (state.filepathActive) {
        updateBottomName();
        $('.bottom-name').removeClass('hidden');
    } else {
        $('.bottom-name').addClass('hidden');
    }
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

/**
 * @param {boolean} pausing 
 */
const showNotifier = (content) => {
    const target = '.notifier';
    let old = document.querySelector(target);
    let newEl = old.cloneNode(true);
    old.parentNode.replaceChild(newEl, old);
    $(target).text(content);

};

/**
 * Master play method
 */
const startShow = () => {
    console.log('startShow');
    showNotifier('play_arrow');
    $('.play-pause').text('pause');
    state.playing = true;
    if (!interval) interval = setTimeout(advanceSlide, (Math.max(state.timer, MIN_TIME)) * 1000);
    nosleep.enable();

    if (state.filepathActive) $('.paused-bit').remove();
};

/**
 * Master pause method
 */
const clearShow = () => {
    if (interval) clearTimeout(interval);
    showNotifier('pause');
    interval = null;
    state.playing = false;
    $('.play-pause').text('play_arrow');
    nosleep.disable();

    if (state.filepathActive) $('.bottom-name').append(CLOCK_IMG);
};

const advanceSlide = () => {
    if (state.actionDisabled) return;
    state.currIndex++;
    if (state.currIndex >= list.length) state.currIndex = 0;
    loadNext();
};

const backSlide = () => {
    if (state.actionDisabled) return;
    state.currIndex--;
    if (state.currIndex < 0) state.currIndex = list.length - 1;
    loadNext();
}

const handlePlayPause = () => {
    if (state.playing) {
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
    const shuf = await fetch('list?shuffled=1');
    shuffledList = await shuf.json();
    console.log(list)
    return json;
}

const getNewShuffleList = async () => {
    const shuf = await fetch('list?newShuffle=1');
    shuffledList = await shuf.json();
    return;
}

const getSlotForIndex = (i) => {
    return `#slot-${ i % 3 }`;
};

const slideChangedActions = () => {
    const prevEle = getSlotForIndex(state.currIndex - 1);
    const currEle = getSlotForIndex(state.currIndex);
    const nextEle = getSlotForIndex(state.currIndex + 1);

    $(prevEle).removeClass('middle-slide');
    $(currEle).removeClass('top-slide');
    $(currEle).addClass('middle-slide');
    $(nextEle).addClass('top-slide');

    updateFavIcon();
    $('.progress.front').width(`${ Math.round((state.currIndex / list.length) * 100 ) }%`)
};

const updateFavIcon = () => {
    const item = useList[state.currIndex].fullPath;
    if (starred[item]) {
        $('.favorite').addClass('active');
    } else {
        $('.favorite').removeClass('active');
    }
};

const updateCaption = () => {
    const useList = selectList();
    const item = useList[state.currIndex];
    $('#mini-filename').text(`(${state.currIndex + 1}/${list.length}) - ${item.add}/${item.item}`);
};

const updateBottomName = () => {
    const useList = selectList();
    const item = useList[state.currIndex];
    $('.bottom-name').text(`${item.add}/${item.item}`);
    if (!state.playing) $('.bottom-name').append(CLOCK_IMG);
};

/**
 * Actual fnc to load the images and manage the cache
 * @param {boolean} skipCurrent 
 */
const loadNext = (skipCurrent = false) => {
    brieflyHideLoader();
    cleanCaches(+state.currIndex);
    loadOne(state.currIndex - 1, false, skipCurrent);
    loadOne(state.currIndex, true, skipCurrent);
    loadOne(state.currIndex + 1, false, skipCurrent);

    loadOne(state.currIndex + 2, false, false, false);
    slideChangedActions();

    if (state.panelOpen) updateCaption();
    if (state.filepathActive) updateBottomName();
};

const loadOne = async (i, onStage, shouldWipe = false, loadDom = true) => {
    const useList = selectList();
    if (!useList[i]) return;
    if (i < 0) i = useList.length - 1;
    if (i >= useList.length) i = 0;
    const target = getSlotForIndex(i);
    if (shouldWipe || onStage) $(target).attr('src', null);
    const fullPath = useList[i].fullPath;
    if (loadDom) $(target).toggleClass('hidden', !onStage);
    const imgStr = cache[i] ? cache[i] : await fetchImage(fullPath);
    cache[i] = imgStr;
    if (loadDom) $(target).attr('src', imgStr);

    if (onStage && state.playing && i === state.currIndex) {
        if (interval) clearTimeout(interval);
        interval = setTimeout(advanceSlide, (Math.max(state.timer, MIN_TIME)) * 1000); 
    }
};

const brieflyHideLoader = () => {
    $('#main-loader').addClass('hidden');
    setTimeout(() => $('#main-loader').removeClass('hidden'), 1000);
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

const adjustInterval = () => {
    const timerTemp = $('#interval-field').val();
    if (timerTemp < MIN_TIME) {
        state.timer = MIN_TIME;
        $('#interval-field').val(MIN_TIME);
    } else {
        state.timer = timerTemp;
    }
};

const selectList = () => {
    return useList = state.shuffle ? shuffledList : list;
};

const rotateImage = async () => {
    if (state.actionDisabled) return;
    state.actionDisabled = true;
    const cachePlay = state.playing;
    if (interval) clearShow();
    showNotifier('rotate_right');
    brieflyHideLoader();
    $('.rotate').addClass('disabled');
    $('#main-loader').addClass('top');
    const fullPath = selectList()[state.currIndex].fullPath;
    const encoded = encodeURIComponent(fullPath);
    const url = `edit?method=rotate&path=${encoded}`;
    await postRequest(url, {});
    const imgStr = await fetchImage(fullPath);
    cache[state.currIndex] = imgStr;
    $(getSlotForIndex(state.currIndex)).attr('src', imgStr);
    $('.rotate').removeClass('disabled');
    $('#main-loader').removeClass('top');
    state.actionDisabled = false;
    if (cachePlay) startShow();
};

const handleOpenOptions = () => {
    if (state.optionsOpen) return;
    setTimeout(() => {
        playCache = state.playing;
        $('.viewer-area').toggleClass('blur', true);
        const useList = selectList();
        constructInfoArea();
        $('#filename').text(useList[state.currIndex].fullPath);
        $('#interval-field').val(state.timer);
        if (state.playing) clearShow();
        $('.toolbar').toggleClass('hidden', false);
        state.optionsOpen = true;
    }, 10);
};

const closeOptions = () => {
    state.optionsOpen = false;
    $('.viewer-area').toggleClass('blur', false);
    $('.toolbar').toggleClass('hidden', true);
    emptyInfoArea();
    if (playCache) startShow();
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
        state.currIndex = +lIndex;
    }
    const lTimer = localStorage.getItem(LS_KEYS.TIMER);
    if (lTimer !== undefined) {
        state.timer = Math.max(+lTimer, 3);
    }
    const lFavs = localStorage.getItem(LS_KEYS.FAVS);
    if (lFavs !== undefined) {
        starred = JSON.parse(lFavs);
    }
    const lShowName = localStorage.getItem(LS_KEYS.SHOW_NAME);
    console.log(lShowName)
    if (lShowName !== undefined) {
        state.filepathActive = lShowName === 'true';
        $('#filepath-toggle').prop('checked', state.filepathActive);
        toggleBottomName(state.filepathActive);
    }


};

/**
 * 
 * @param {boolean} show 
 */
const showControl = (show) => {
    $('.control-bar').toggleClass('control-bar-hover', show);
    state.panelOpen = show;
    if (show) updateCaption();
};

const showFavbar = (show) => {
    $('.fav-bar').toggleClass('control-bar-hover', show);
    state.favsOpen = show;
    if (show) renderStarredList();
};

const showTripsbar = (show) => {
    $('.trips-bar').toggleClass('control-bar-hover', show);
    state.tripsOpen = show;
    const currFile = selectList()[state.currIndex];
    if (show && handleTripPanel) handleTripPanel(currFile);
};

const constructInfoArea = async () => {
    $('.info-area').append(LOADER_IMG);
    const res = await fetch('config');
    const json = await res.json();
    const exif = await getExif();
    const gps = exif.gps ? processGPSExif(exif.gps) : null;
    const exifInsert = constructExifInfo(exif, gps);
    const { basePath, exclude, version } = json;
    const contents = `
        <h3>Image Exif Data</h3>
        ${exifInsert}
        <h3>Back-end Information</h3>
        <li>Root Scan Path: ${basePath}</li>
        <li>Excluded Dirs: ${exclude.join(',')}</li>
        <li>Version: ${version}</li>
        <li>Powered by 我是印度人™ tech</li>
        `;
    $('.info-area').empty();
    $('.info-area').append(contents);
};

const processGPSExif = (info) => {
    const { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = info;
    return {
        long: singleGPSParse(GPSLongitude, GPSLongitudeRef),
        lat: singleGPSParse(GPSLatitude, GPSLatitudeRef)
    }
};

const singleGPSParse = (dms, ref) => {
    try {
        let dd = dms[0] + dms[1] / 60 + dms[2] / (60 * 60);
        if (ref == 'S' || ref == 'W') dd = dd * -1;
        return dd;
    } catch (e) {
        return 0;
    }
};

const constructExifInfo = (info, gps) => {
    if (info.message) {
        return '<li>Could not read Exif data</li>';
    }
    const {
        ExposureTime,
        FNumber,
        ISO,
        CreateDate,
        LensMake,
        LensModel
    } = info;
    const mod = (info) => info ? info : 'unknown';

    setTimeout(() => placeMap(gps), 10);

    const validGPS = !!gps.long && gps.lat;

    return `
        <li>Create Date: ${mod(CreateDate)}</li>
        <li>Aperture: ${mod(FNumber)}</li>
        <li>Exposure Time: ${mod(decimalToFraction(ExposureTime))}</li>
        <li>ISO: ${mod(ISO)}</li>
        <li>Lens: ${mod(LensMake)} ${mod(LensModel)}</li>
        ${validGPS ? '<div id="map"></div>' : ''}
    `;
};

const placeMap = (gps) => {
    const { long, lat } = gps;
    if (!long || !lat) return;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [long, lat],
        zoom: 7
    });

    let imgLoaded = false;

    map.on('styledata', function () {
        if (imgLoaded) return;
        imgLoaded = true;
        map.loadImage('img/cat.gif', function (error, image) {
            if (error) throw error;
            map.addImage('cat', image);
            map.addLayer({
                "id": "points",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [long, lat]
                            }
                        }]
                    }
                },
                "layout": {
                    "icon-image": "cat",
                    "icon-size": 0.25
                }
            });
        });
    });
};

const emptyInfoArea = () => {
    map = null;
    $('.info-area').empty();
}; 

const getExif = async () => {
    try {
        const encoded = encodeURIComponent(selectList()[state.currIndex].fullPath);
        const res = await fetch(`exif?path=${encoded}`);
        const json = await res.json();
        return json;
    } catch (e) {
        console.log('Error getting exif', e);
    }
};

const addFav = (pathName) => {
    showNotifier('favorite');
    starred[pathName] = 1;
    renderStarredList();
};

const removeFav = (pathName) => {
    if (!starred[pathName]) return;
    delete starred[pathName];
    renderStarredList();
};

const handleFav = () => {
    const pathName = useList[state.currIndex].fullPath;
    if (starred[pathName]) {
        removeFav(pathName);
    } else {
        addFav(pathName);
    }
    updateFavIcon();
};

const renderStarredList = () => {
    if (!state.favsOpen) return;
    // cache saved pos to reinstate after rendering
    const paths = Object.keys(starred);
    $('.fav-bar').empty();
    const addition = `
        <h3>Favorites</h3>
        ${paths.map(path => `
            <div class="favorite-row" onclick="showFav('${path}')">${path}</div>
        `).join('')}
        <div class="option setting copy-favs" onclick="copyFavs()">Copy list to clipboard</div>
    `;
    $('.fav-bar').append(addition);
};

const copyFavs = () => {
    const string = JSON.stringify(Object.keys(starred));
    copyToClipboard(string);
};

const showFav = (path) => {
    if (state.playing) clearShow();
    console.log('showfav', path);
    const list = selectList();
    const index = list.map(i => i.fullPath).indexOf(path);
    state.currIndex = index;
    loadNext();
};

const copyShuffle = () => {
    const json = JSON.stringify(shuffledList);
    copyToClipboard(json);
};

const shuffleAfter = async () => {
    const newList = await postRequest(`/shuffle-after?index=${state.currIndex + 1}`);
    shuffledList = newList;
    clearCache();
    loadNext();
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

/* Courtesy anazard - github  */
const copyToClipboard = (text) => {
    showNotifier('file_copy');
    const body = document.querySelector('body');
    let $tempInput = document.createElement('INPUT');
    body.appendChild($tempInput);
    $tempInput.setAttribute('value', text)
    $tempInput.select();
    document.execCommand('copy');
    body.removeChild($tempInput);
};


const addListeners = () => {
    $('body').css('cursor', 'none');

    window.onbeforeunload = () => {
        localStorage.setItem(LS_KEYS.POS, state.currIndex);
        localStorage.setItem(LS_KEYS.TIMER, state.timer);
        localStorage.setItem(LS_KEYS.SHOW_NAME, state.filepathActive);
        localStorage.setItem(LS_KEYS.FAVS, JSON.stringify(starred));

    };

    let specifiedElement = document.querySelector('.toolbar');
    document.addEventListener('click', (event) => {
        let isClickInside = specifiedElement.contains(event.target);

        if (!isClickInside && state.optionsOpen) {
            closeOptions();
        }
    });

    $('.control-bar').hover(
        () => showControl(true),
        () => showControl(false)
    );

    let favBarTimeout;
    $('.fav-bar').hover(
        () => {
            favBarTimeout = setTimeout(() => showFavbar(true), BAR_HOVER_TIME);
        },
        () => showFavbar(false)
    );
    $('.fav-bar').mouseleave(() => {
        if (!!favBarTimeout) clearTimeout(favBarTimeout);
    });

    let tripBarTimeout;
    $('.trips-bar').hover(
        () => {
            tripBarTimeout = setTimeout(() => showTripsbar(true), BAR_HOVER_TIME);
        },
        () => showTripsbar(false)
    );
    $('.trips-bar').mouseleave(() => {
        if (!!tripBarTimeout) clearTimeout(tripBarTimeout);
    });

    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        const key = e.key;
        switch (key) {
            case ' ':
                return handlePlayPause();
            case 'ArrowLeft':
                return backSlide();
            case 'ArrowRight':
                return advanceSlide();
            case 'r':
                if (state.optionsOpen) return;
                return rotateImage();
            case 'f':
                return handleFav();
        }
    });

    $('body').mousemove(() => {
        if (!forceHide) {
            $('body').css('cursor', '');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                $('body').css('cursor', 'none');

                forceHide = true;
                setTimeout(() => {
                    forceHide = false;
                }, 200);
            }, 1000);
        }
    });
};

const getMapbox = async () => {
    try {
        const res = await fetch('mapbox-key');
        const fetchedKey = await res.text();
        if (mapboxgl) mapboxgl.accessToken = fetchedKey;
    } catch (e) {
        console.error('Failed to get mapbox key.', e);
    }
}
                          
const main = async () => {
    await getFileList();
    checkIndex();
    $('#shuffle-option').toggleClass('active', state.shuffle);
    addListeners();
    getMapbox();
    loadNext();
    startShow();
};

$(document).ready(main);

/** Courtesy redteamsnippets from Github */
function gcd(a, b) {
    return (b) ? gcd(b, a % b) : a;
}
var decimalToFraction = function (decimal) {
    if (!decimal) return null;

    const _decimal = +decimal;
    if (_decimal == parseInt(_decimal)) {
        return {
            top: parseInt(_decimal),
            bottom: 1,
            display: parseInt(_decimal) + '/' + 1
        };
    }
    else {
        var top = _decimal.toString().includes('.') ? _decimal.toString().replace(/\d+[.]/, '') : 0;
        var bottom = Math.pow(10, top.toString().replace('-', '').length);
        if (_decimal >= 1) {
            top = +top + (Math.floor(_decimal) * bottom);
        }
        else if (_decimal <= -1) {
            top = +top + (Math.ceil(_decimal) * bottom);
        }

        var x = Math.abs(gcd(top, bottom));
        const fracString = `${top / x}/${bottom / x}`;
        return fracString.length > 10 ? decimal : fracString;
    }
};
