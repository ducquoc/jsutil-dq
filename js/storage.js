/**
 * local storage HTML5 (<- Google Gears <- flash's ExternalInteface <- cookies)
 * @see Modernizr.localstorage
 */
var LS = (function() {
    var storage;
    var result;
    var uid = new Date;
    try {
        (storage = window.localStorage).setItem(uid, uid);
        result = storage.getItem(uid) == uid;
        storage.removeItem(uid);
        return result && storage;
    } catch (e) {
        // return {};
    }
}());

// global storage
try { window.GS = (localStorage.getItem) ? localStorage: {}; } catch(e) {window.GS={};}
if (!LS) LS = GS;


//LS.key1 = '111 byProperty ';
//alert("[preferred] " + LS.key1);
//if(LS) { LS['key2'] = '222 byAssociateArray '; alert("[secondary] " + LS['key2']); }
//if(LS.getItem) LS.setItem('key3', "333 bySetter ");
