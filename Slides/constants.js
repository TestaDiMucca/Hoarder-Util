const DEFAULT_PORT = 4001;
const DEFAULT_SCAN_PATH = './Photos';
const VER = '0.0.1';
const CONFIG_PATH = './config.json';
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;
const NAMES = [
    'Tomoko', 'Kurisu', 'Rui', 'Anzu', 'Emilia', 'Yukako', 'Lalatina', 'Sucy', 'Hanekawa',
    'Deedlit', 'Mai', 'Raphtalia', 'Cattleya', 'Hana', 'Nanachi', 'Hayasaka'
];

module.exports = {
    CONFIG_PATH,
    DEFAULT_PORT,
    DEFAULT_SCAN_PATH,
    VER,
    SUPPORTED_FORMATS,
    REFRESH_INTERVAL,
    NAMES
};
