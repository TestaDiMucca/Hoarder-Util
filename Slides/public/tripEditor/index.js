/**
 * A day's events
 * @typedef {Object} TripDay
 * @property {number} id
 * @property {string} date ISO string for the day
 * @property {string} description Description of the day's events
 */

/**
 * A whole trip
 * @typedef {Object} Trip
 * @property {number} id
 * @property {string} title
 * @property {string} startDate in ISO String
 * @property {string} endDate in ISO String
 * @property {TripDay[]} days
 */

let tripsCache = {};
let tripDaysCache = {};

 /**
  * @param {Trip[]} list 
  */
const tripList = (list) => {
    return `
        <h1>Trip List</h1>
        <div class="trip-list">
            ${list.map(trip => oneTrip(trip)).join('')}
        </div>
    `;
};

/**
 * @param {Trip} trip 
 */
const oneTrip = (trip) => {
    return `
        <div class="trip">
            <h2>${trip.title}</h2>
            <div class="trip-day-list">
                ${trip.days.map((day, i) => oneTripDay(day, i)).join('')}
            </div>
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
        <div class="trip-day" id="${tag}" onclick="handleEditDay('${tag}', '${tripDay.id}')">
            ${tripDay.date}: ${tripDay.description}
        </div>
    `;
};

const tripEditor = (trip) => {

};

const handleEditTrip = (tag, id) => {
    
};

const handleEditDay = (tag, id) => {
    console.log('edit', tag, +id);
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

/**
 * faxios means fake axios.
 */
const faxios = {
    handleRes: async (res) => {
        return new Promise(async resolve => {
            const text = await res.text();
            try {
                resolve(JSON.parse(text));
            } catch (e) {
                resolve(text);
            }
        });
    },
    get: async (url) => {
        return new Promise(async resolve => {
            const res = await fetch(url);
            resolve(await faxios.handleRes(res));
        });
    },
    post: async (url, params) => {
        return new Promise(async resolve => {
            const options = {
                headers: {
                    'content-type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify(params),
                method: 'post'
            };

            const res = await fetch(url, options);
            resolve(await faxios.handleRes(res));
        });
    },
    put: async (url, params) => {
        return new Promise(async resolve => {
            const options = {
                headers: {
                    'content-type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify(params),
                method: 'put'
            };

            const res = await fetch(url, options);
            resolve(await faxios.handleRes(res));
        });
    },
    put: async (url) => {
        return new Promise(async resolve => {
            const options = {
                method: 'delete'
            };
            const res = await fetch(url, options);
            resolve(await faxios.handleRes(res));
        });
    }
}

const main = async () => {
    console.log('TRIP HANDLERRR');
    getList();
};

$(document).ready(main);