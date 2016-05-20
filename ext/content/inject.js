var rnd = Math.random();
var s = document.createElement('script');
s.setAttribute('data-rnd', rnd);
s.innerText = "$('.act-bar > .inner > .form-group > .input-select-a.gift-num-select > .input-text > .value').trigger('change'); document.querySelector('head > script[data-rnd=\"" + rnd + "\"]').remove(); ";
(document.head || document.documentElement).appendChild(s);
