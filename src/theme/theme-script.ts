export const THEME_STORAGE_KEY = 'stacket-theme';

export const themeScript = `(function(){try{
var s=localStorage.getItem('${THEME_STORAGE_KEY}');
var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', s || (d?'dark':'light'));
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
