import { LOCALE_STORAGE_KEY } from "@/lib/i18n/types";

/**
 * Inline pre-paint redirect for `/` only. Skips when `?stay=1` is present
 * (debugging / Search Console fetch testing).
 */
export const localeRedirectScript = `(function(){try{if(location.search.indexOf("stay=1")!==-1)return;var k=${JSON.stringify(LOCALE_STORAGE_KEY)};var s=localStorage.getItem(k);var t="en";if(s==="ar"||s==="en"){t=s}else{var ls=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<ls.length;i++){if(String(ls[i]).toLowerCase().indexOf("ar")===0){t="ar";break}}}location.replace("/"+t+"/")}catch(e){}})();`;
