// ============================================
// TRACKING PIXELS CONFIGURATION
// ============================================
// Add your tracking pixel IDs below.
// Each platform's pixel will be injected automatically.
// ============================================

const TRACKING_PIXELS = {

    // --- META (Facebook & Instagram) Pixel ---
    facebook: {
        enabled: true,
        pixelId: 'YOUR_FB_PIXEL_ID_HERE',
        // Example: pixelId: '123456789012345'
    },

    // --- Snapchat Pixel ---
    snapchat: {
        enabled: true,
        pixelId: 'YOUR_SNAP_PIXEL_ID_HERE',
        // Example: pixelId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    },

    // --- TikTok Pixel ---
    tiktok: {
        enabled: true,
        pixelId: 'YOUR_TIKTOK_PIXEL_ID_HERE',
        // Example: pixelId: 'CABCDEFGHIJKLMN'
    },

    // --- Google Analytics / Google Ads ---
    google: {
        enabled: true,
        measurementId: 'YOUR_GA_MEASUREMENT_ID_HERE',
        // Example: measurementId: 'G-XXXXXXXXXX'
        googleAdsId: 'YOUR_GOOGLE_ADS_ID_HERE',
        // Example: googleAdsId: 'AW-XXXXXXXXXX'
    },

    // --- Instagram (uses same pixel as Facebook) ---
    instagram: {
        enabled: true,
        // Uses facebook.pixelId automatically
    }
};

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

(function() {
    'use strict';

    // --- Facebook / Meta Pixel ---
    if (TRACKING_PIXELS.facebook.enabled && TRACKING_PIXELS.facebook.pixelId !== 'YOUR_FB_PIXEL_ID_HERE') {
        !function(f,b,e,v,n,t,s){
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', TRACKING_PIXELS.facebook.pixelId);
        fbq('track', 'PageView');

        // Track Book Now clicks
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-book')) {
                fbq('track', 'InitiateCheckout');
            }
        });
    }

    // --- Snapchat Pixel ---
    if (TRACKING_PIXELS.snapchat.enabled && TRACKING_PIXELS.snapchat.pixelId !== 'YOUR_SNAP_PIXEL_ID_HERE') {
        !function(e,t,n){
            if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?
            a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);
            r.async=!0;r.src='https://sc-static.net/scevent.min.js';
            var c=t.getElementsByTagName(s)[0];
            c.parentNode.insertBefore(r,c);
        }(window,document);
        snaptr('init', TRACKING_PIXELS.snapchat.pixelId);
        snaptr('track', 'PAGE_VIEW');
    }

    // --- TikTok Pixel ---
    if (TRACKING_PIXELS.tiktok.enabled && TRACKING_PIXELS.tiktok.pixelId !== 'YOUR_TIKTOK_PIXEL_ID_HERE') {
        !function (w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = w[t] = w[t] || [];
            ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"],
            ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
            for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
            ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e };
            ttq.load = function (e, n) { var i = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=b4jc3q6c2h6pgqu4u6i0&lib=" + e; var r = document.getElementsByTagName("script")[0]; r.parentNode.insertBefore(o, r) };
            ttq.load(TRACKING_PIXELS.tiktok.pixelId);
            ttq.page();
        }(window, document, 'ttq');
    }

    // --- Google Analytics (gtag) ---
    if (TRACKING_PIXELS.google.enabled && TRACKING_PIXELS.google.measurementId !== 'YOUR_GA_MEASUREMENT_ID_HERE') {
        var gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + TRACKING_PIXELS.google.measurementId;
        document.head.appendChild(gaScript);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', TRACKING_PIXELS.google.measurementId);

        if (TRACKING_PIXELS.google.googleAdsId && TRACKING_PIXELS.google.googleAdsId !== 'YOUR_GOOGLE_ADS_ID_HERE') {
            gtag('config', TRACKING_PIXELS.google.googleAdsId);
        }
    }

    // --- Helper: Track custom events ---
    window.trackEvent = function(eventName, params) {
        params = params || {};

        if (TRACKING_PIXELS.facebook.enabled && typeof fbq !== 'undefined') {
            fbq('track', eventName, params);
        }
        if (TRACKING_PIXELS.snapchat.enabled && typeof snaptr !== 'undefined') {
            snaptr('track', eventName, params);
        }
        if (TRACKING_PIXELS.tiktok.enabled && typeof ttq !== 'undefined') {
            ttq.track(eventName, params);
        }
        if (TRACKING_PIXELS.google.enabled && typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    };

})();
