/**
 * @file Main behaviours for all the trip editor page
 */

/**
 * A day's events
 * @typedef {Object} TripDay
 * @property {number} id
 * @property {string} date YYYY-MM-DD for the day
 * @property {string} description Description of the day's events
 */

/**
 * A whole trip
 * @typedef {Object} Trip
 * @property {number} id
 * @property {string} directory
 * @property {string} title
 * @property {string} startDate in YYYY-MM-DD
 * @property {string} endDate in YYYY-MM-DD
 * @property {TripDay[]} days
 */

const LAST_DUMMY_ID = 999;

let tripsCache = {};
let tripDaysCache = {};
let state = {
    editing: false,
    editingTripId: null
};

 /**
  * @param {Trip[]} list 
  */
const tripList = (list) => {
    return `
        <h1>Trip List</h1>
        <div class="trip-list">
            ${list.map(trip => oneTrip(trip)).join('')}
        </div>
        <div id="trip-${LAST_DUMMY_ID}"></div>
        <span class="add-button" onclick="handleEditTrip()">Add Trip</span>
    `;
};

/**
 * @param {Trip} trip 
 */
const oneTrip = (trip) => {
    const tag = `trip-${trip.id}`;
    return `
        <div class="trip" id="${tag}">
            <span class="title-bar">
                <h2>${trip.title}</h2>
                <h3>${trip.directory ? trip.directory : ''}</h3>
                <div class="controls">
                    <i class="material-icons option" onclick="handleEditTrip('${tag}', '${trip.id}')">
                        create
                    </i>
                    <i class="material-icons option" onclick="removeTrip('${trip.id}')">
                        delete
                    </i>
                </div>
            </span>
            <div class="trip-day-list">
                ${trip.days.map((day, i) => oneTripDay(day, i)).join('')}
                <div id="trip-day-${trip.id}-${LAST_DUMMY_ID}"></div>
            </div>
            <span class="add-button" onclick="handleEditDay('${trip.id}')">Add Day</span>
        </div>
    `;
};

/**
 * @param {TripDay} tripDay 
 * @param {number} i
 */
const oneTripDay = (tripDay, i) => {
    const tag = `trip-day-${tripDay.id}`;
    return `
        <div class="trip-day" id="${tag}">
            <div class="controls">
                <i class="material-icons option" onclick="handleEditDay(null, '${tag}', '${tripDay.id}')">
                    create
                </i>
                <i class="material-icons option" onclick="removeTripDay('${tripDay.id}')">
                    delete
                </i>
            </div>
            ${tripDay.date}: ${tripDay.description}
        </div>
    `;
};

const tripEditor = (trip) => {

};

/**
 * If no tag or ID is provided, adding new
 * @param {string} tag 
 * @param {string} id 
 */
const handleEditTrip = (tag = `trip-${LAST_DUMMY_ID}`, id = null) => {
    if (state.editing) return;
    state.editing = true;
    console.log('edit', tag, +id);
    const tripEditor = `
        <div class="editor">
            <i class="material-icons option" onclick="cancelEditing()">
                close
            </i>
            <input type="text" id="title-field" placeholder="Title" />
            <input type="text" id="directory-field" placeholder="Directory" />
            <div class="submit-button" onclick="submitTrip('${id}')">Submit</div>
        </div>
    `;
    $('#' + tag).append(tripEditor);
    
    const cached = tripsCache[id];
    if (!!cached) {
        $('#title-field').val(cached.title);
        $('#directory-field').val(cached.directory);
    }
};

/**
 * If no tag or ID is provided, adding new
 * @param {string} tag 
 * @param {string} id 
 */
const handleEditDay = (tripId = 0, tag = null, id = null) => {
    if (state.editing) return;
    state.editing = true;
    if (!tag) tag = `trip-day-${tripId}-${LAST_DUMMY_ID}`;
    console.log('edit', tripId, tag, +id);
    const tripDayEditor = `
        <div class="editor">
            <i class="material-icons option" onclick="cancelEditing()">
                close
            </i>
            <input type="text" id="date-field" placeholder="Date: YYYY-MM-DD" />
            <input type="text" id="description-field" placeholder="Description" />
            <div class="submit-button" onclick="submitTripDay('${tripId}', '${id}')">Submit</div>
        </div>
    `;
    $('#' + tag).append(tripDayEditor);
    
    const cached = tripDaysCache[id];
    if (!!cached) {
        $('#date-field').val(cached.date);
        $('#description-field').val(cached.description);
    }
};

const cancelEditing = () => {
    state.editing = false;
    $('.editor').remove();
};

/**
 * Use for edit and new, depends on if ID included
 * @param {*} id 
 */
const submitTrip = async (id) => {
    if (id === 'null') id = null;
    const title = $('#title-field').val();
    const directory = $('#directory-field').val();
    console.log('submitting', id, title, directory);
    await createOrUpdate('/trips', id, {
        directory,
        title
    });
    cancelEditing();
    getList();
};

/**
 * Use for edit and new, depends on if ID included
 * @param {*} tripId 
 * @param {*} id 
 */
const submitTripDay = async (tripId, id) => {
    if (id === 'null') id = null;
    const date = $('#date-field').val();
    const description = $('#description-field').val();
    console.log('submitting', tripId, id, date, description);
    await createOrUpdate('/trips/days', id, {
        date,
        description,
        tripId
    });
    cancelEditing();
    getList();
};

const createOrUpdate = async (url, id, params) => {
    console.log('create or update', !!id)
    if (!!id) {
        await faxios.put(url, { id: +id, ...params });
    } else {
        await faxios.post(url, params);
    }
};

const removeTrip = async (id) => {
    await faxios.delete(`/trips/${id}`);
    getList();
};

const removeTripDay = async (id) => {
    await faxios.delete(`/trips/days/${id}`);
    getList();
};

const getList = async () => {
    clearContent();
    tripsCache = {};
    tripDaysCache = {};
    /** @type Trip[] */
    const listData = await faxios.get('/trips');
    console.log(listData)
    listData.map(trip => {
        tripsCache[trip.id] = trip;
        trip.days.forEach(day => tripDaysCache[day.id] = day);
    });
    const elements = tripList(listData);
    $('.content').append(elements);
};


const clearContent = () => {
    $('.content').empty();
};

const main = async () => {
    console.log('TRIP HANDLERRR');
    getList();
};

$(document).ready(main);
