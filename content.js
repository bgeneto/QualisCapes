const isFirefox = navigator.userAgent.match(/(?:firefox|fxios)\/(\d+)/) !== null;
const url = window.location.href;

// only run our main funtion after document load
window.addEventListener("pageshow", main, false);

/**
 * Function that returns a Qualis based on scopus percentile
 * @author Bernhard Enders
 *
 * @param {number} val - percentile value
 * @return {string} - qualis capes string
 */
function percentileQualis(val) {
    qualis = "?";
    if (val >= 87.5) {
        qualis = "A1";
    } else if (val >= 75) {
        qualis = "A2";
    } else if (val >= 62.5) {
        qualis = "A3";
    } else if (val >= 50) {
        qualis = "A4";
    } else if (val >= 37.5) {
        qualis = "B1";
    } else if (val >= 25) {
        qualis = "B2";
    } else if (val >= 12.5) {
        qualis = "B3";
    } else {
        qualis = "B4";
    }
    return qualis;
}

/**
 * Function that filters a selector that matches the given regex
 * @author Bernhard Enders
 *
 * @param {string} selector - DOM selector to check
 * @param {string} text - regex string to check against
 * @return {Array} - all elements/selectors that matches the selector filtered by regex
 */
function contains(selector, text) {
    var elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function (element) {
        return RegExp(text).test(element.innerText);
    });
}

/**
 * Function to add the Qualis factor to page contents
 * @author Bernhard Enders
 *
 * @param {Object} search - search object containing the selector and regex to use
 */
function insertQualis(search) {
    elems = contains(search.selector, search.retype.regex);
    for (let i = 0; i < elems.length; i++) {
        let percentileVal = null;
        try {
            percentileVal = parseFloat(elems[i].innerText.slice(0, -search.retype.strip_nchars));
        } catch (e) { }
        if (percentileVal !== null) {
            elems[i].innerText = percentileVal + "% (" + percentileQualis(percentileVal) + ")";
        }
    }
}

/**
 * Function that searches where to put the Qualis factor in the main scopus page: sources.uri
 * @author Bernhard Enders
 */
function mainQualis() {
    // regex to match the percentiles containing a % symbol at the end
    const percent = { 'regex': /[0-9]{1,2}\%/, strip_nchars: 1 };
    const search = [
        { 'selector': '#sourceResults > tbody tr > td > a', 'retype': percent }
    ];
    for (let i = 0; i < search.length; i++) {
        insertQualis(search[i]);
    }
}

/**
 * Function that searches where to put the Qualis factor in other scopus pages
 * @author Bernhard Enders
 */
function extraQualis() {
    // regex to match the percentiles as ordinal numbers
    const ordinal = { 'regex': /[0-9]{1,2}(st|nd|rd|th)/, strip_nchars: 2 };
    const search = [
        { 'selector': '#sourceRankContainer > span.percentileText', 'retype': ordinal },
        { 'selector': '#CSCategoryTBody > tr > td div', 'retype': ordinal },
        { 'selector': '#rankingTable > tbody > tr > td', 'retype': ordinal }
    ];
    for (let i = 0; i < search.length; i++) {
        insertQualis(search[i]);
    }
}

/**
 * Function that searches where to put the Qualis factor in other scopus pages
 * @author Bernhard Enders
 */
function main() {
    // add qualis factor to scopus  sources.uri page
    if (url.includes("scopus.com/sources")) {
        mainQualis();
    } else if (url.includes("scopus.com/sourceid")) {
        // max wait for specific element to load
        const MAX_WAIT = 10;

        // wait for this element to load
        const contentLoadedSelector = '#rankingTable > tbody > tr.row0 > td:nth-child(1)';

        // set interval to check if element is loaded
        var jsInitChecktimer = setInterval(checkForJsFinish, 250);

        let retries = 0;
        var exceededMaxWait = function () {
            retries += 1;
            if (retries > MAX_WAIT) {
                console.log("WARNING - Qualis Capes - Content not loaded properly!");
                clearInterval(jsInitChecktimer);
                return true;
            }
            return false;
        };

        function checkForJsFinish() {
            try {
                // query content
                str = document.querySelector(contentLoadedSelector).innerText;
                // check if content is loaded
                if (str !== "") {
                    // unset interval, add qualis factor and exit
                    clearInterval(jsInitChecktimer);
                    extraQualis();
                    return;
                } else if (exceededMaxWait()) return;
            } catch (e) {
                if (exceededMaxWait()) return;
            }
        }
    }
}
