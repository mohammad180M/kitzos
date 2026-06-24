/** Inline script: apply saved locale (dir/lang) before paint to prevent flash. */
export const localeInitScript = `(function(){try{var d=document.documentElement,l=localStorage.getItem('kitzos-lang');if(l==='ar'){d.setAttribute('dir','rtl');d.setAttribute('lang','ar')}else{d.setAttribute('dir','ltr');d.setAttribute('lang','en')}}catch(e){}})();`;
