function formatNumber(number, long = false, digits = 2) {
    if(!number || number === "") {
        return '--';
    }
    if (number >= 1e12) {
        var trillions = number / 1e12;
        return trillions.toFixed(digits) + (long ? (trillions === 1 ? ' Trillion' : ' Trillions') : ' T');
    } else if (number >= 1e9) {
        var billions = number / 1e9;
        return billions.toFixed(digits) + (long ? (billions === 1 ? ' Billion' : ' Billions') : ' B');
    } else if (number >= 1e6) {
        var millions = number / 1e6;
        return millions.toFixed(digits) + (long ? (millions === 1 ? ' Million' : ' Millions') : ' M');
    } else if (number >= 1e3) {
        var thousands = number / 1e3;
        return thousands.toFixed(digits) + (long ? (thousands === 1 ? ' Thousand' : ' Thousands') : ' K');
    } else {
        return number.toFixed(digits);
    }
}

function getMeasurementUnit(number, long = false) {
    if (number >= 1e12) {
        return long ? 'Trillions' : 'T';
    } else if (number >= 1e9) {
        return long ? 'Billions' : 'B';
    } else if (number >= 1e6) {
        return long ? 'Millions' : 'M';
    } else if (number >= 1e3) {
        return long ? 'Thousands' : 'K';
    }
    return '';
}

function fixInUnit(number, unit, digits = 2) {
    if (unit === 'Trillions' || unit === 'T') {
        number = number / 1e12;
    } else if (unit === 'Billions' || unit === 'B') {
        number = number / 1e9;
    } else if (unit === 'Millions' || unit === 'M') {
        number = number / 1e6;
    } else if (unit === 'Thousands' || unit === 'K') {
        number = number / 1e3;
    }
    return number.toFixed(digits);
}

function createArray(start, end) {
    return Array.from({ length: end - start + 1 }, (v, i) => i + start);
}

function getDivider(min, max) {
    const range = Math.abs(max- min);
    if (range < 13) return 1;
    else if (range < 30) return 2;
    return 5;
}

const dollarSign = (parameter) => {
    return parameter !== 'inflation' ? '$' : '';
}

const percentSign = (parameter) => {
    return parameter === 'inflation' ? ' %' : '';
}

const unit = (parameter) => {
    return parameter === 'inflation' ? '%' : '$';
}

export { formatNumber, getMeasurementUnit, fixInUnit, createArray, getDivider, dollarSign, percentSign, unit};