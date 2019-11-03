/**
 * @file Separate file for all the trip handling functions, may expand functionality in future
 */

/** @type Trip[] */
let tripsCache = null;

/**
 * A return result of the scan
 * @typedef {Object} ScannedFile
 * @property {string} item
 * @property {string} fullPath
 * @property {string} add
 */

/**
* A day's events
* @typedef {Object} DayTrip
* @property {string} date ISO string for the day
* @property {string} description Description of the day's events
*/

/**
 * A whole trip
 * @typedef {Object} Trip
 * @property {string} directory Files in this directory belong to this trip
 * @property {string} title
 * @property {string} startDate in ISO String
 * @property {string} endDate in ISO String
 * @property {DayTrip[]} days
 */


/**
 * Panel was called to be open, populate it
 * In the future, we may want to pull exif data and search by dates
 * @param {ScannedFile} currFile
 */
const handleTripPanel = async (currFile) => {
    $('.trips-bar').empty();
    let tripsList = await getTrips();
    // With the current file look for the trip according to directory
    // In the future we can look for the trip by date
    let foundTrip;
    for (let i = 0; i < tripsList.length; i++) {
        const dirList = tripsList[i].directory ? tripsList[i].directory.split(',').map(dir => dir.trim()) : null;
        if (!dirList) continue;
        for (let j = 0; j < dirList.length; j++) {
            if (currFile.fullPath.indexOf(dirList[j]) !== -1) {
                foundTrip = tripsList[i];
                renderTrip(foundTrip);
                return;
            }
        }
    }
    $('.trips-bar').append('<p>No trip found for this photo <br/> Tip: trips are determined by their directory</p>')
};

/**
 * Create the html elements for this trip
 * @param {Trip} trip 
 */
const renderTrip = (trip) => {
    const dateBit = [trip.startDate, trip.endDate].filter(bit => !!bit && bit !== '').join(' - ');
    const element = `
        <h3>${trip.title}</h3>
        <h4 class="trip-directory"><i class="material-icons">folder</i>${trip.directory}</h4>
        <h4 class="trip-dates">${dateBit}</h4>
        <div class="day-list">
            ${trip.days.map(day => (`
                    <div class="trip-day">
                        <h4>${day.date}</h4>
                        <p>${day.description}</p>
                    </div>
                `)).join('')
            }
        </div>
    `;

    $('.trips-bar').append(element);
};

/**
 * Get the list of trips from back-end
 * @returns {Trip[]}
 */
const getTrips = async () => {
    const listData = tripsCache ? tripsCache : await faxios.get('/trips');
    tripsCache = listData;
    return tripsCache;
}
