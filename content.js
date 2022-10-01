const isFirefox = navigator.userAgent.match(/(?:firefox|fxios)\/(\d+)/) !== null;
const url = window.location.href;


function percentileQualis(val){
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


function contains(selector, text) {
    var elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function(element){
    return RegExp(text).test(element.textContent);
  });
}


function qualis() {
    elems = contains('#sourceResults tbody td > a', /[0-9]{1,2}\%/);
    for (let i = 0; i < elems.length; i++) {
        let percentile_val = null;
        try {
            percentile_val = parseFloat(elems[i].innerText.slice(0, -1));
       } catch(e) {}
       if (percentile_val !== null) {
            elems[i].innerText = percentile_val + "% (" + percentileQualis(percentile_val) + ")";
       }
    }
}


(function () {
    if (url.includes("scopus.com/sources")) {
        qualis();
    }
})();
