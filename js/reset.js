(function (doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      window.clientWidth = docEl.clientWidth;
      if (!window.clientWidth) return;
      docEl.style.fontSize = 40 * (window.clientWidth / 640) + 'px';
      window.base = 40 * (window.clientWidth / 640);
    };
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
window.canvasWidth = document.documentElement.clientWidth;
window.canvasHeight = document.documentElement.clientHeight;