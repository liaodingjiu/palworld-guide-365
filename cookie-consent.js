/* === PalGuide Cookie Consent & Analytics Manager === */
(function() {
  'use strict';

  var SITE_URL = 'palworldguides.com';
  var GA_ID = 'G-8T3TKL3W4T';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
  }

  function loadAnalytics() {
    if (!GA_ID) return;
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
    window.gtag = gtag;
  }

  var consent = getCookie('palguide-consent');
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'declined') {
    // No decision yet — show banner
    var banner = document.createElement('div');
    banner.className = 'cookie-banner visible';
    banner.id = 'cookieBanner';
    banner.innerHTML = '<div class="cookie-inner">' +
      '<p>We use cookies to analyze traffic and serve personalized ads. By accepting, you agree to our <a href="privacy.html">Privacy Policy</a>.</p>' +
      '<div class="cookie-btns">' +
        '<button class="cookie-decline" id="cookieDecline">Decline</button>' +
        '<button class="cookie-accept" id="cookieAccept">Accept</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(banner);

    document.getElementById('cookieAccept').addEventListener('click', function() {
      setCookie('palguide-consent', 'accepted', 365);
      banner.style.display = 'none';
      loadAnalytics();
    });

    document.getElementById('cookieDecline').addEventListener('click', function() {
      setCookie('palguide-consent', 'declined', 365);
      banner.style.display = 'none';
    });
  }
})();
