"use strict";
function isPlainObject(value) {
    return Boolean(value &&
        !Array.isArray(value) &&
        typeof value === 'object');
}
function getHeaderValueFromOptions(options) {
    var FEATURES = {
        accelerometer: 'accelerometer',
        ambientLightSensor: 'ambient-light-sensor',
        autoplay: 'autoplay',
        camera: 'camera',
        documentDomain: 'document-domain',
        documentWrite: 'document-write',
        encryptedMedia: 'encrypted-media',
        fontDisplayLateSwap: 'font-display-late-swap',
        fullscreen: 'fullscreen',
        geolocation: 'geolocation',
        gyroscope: 'gyroscope',
        layoutAnimations: 'layout-animations',
        legacyImageFormats: 'legacy-image-formats',
        loadingFrameDefaultEager: 'loading-frame-default-eager',
        magnetometer: 'magnetometer',
        microphone: 'microphone',
        midi: 'midi',
        notifications: 'notifications',
        oversizedImages: 'oversized-images',
        payment: 'payment',
        pictureInPicture: 'picture-in-picture',
        push: 'push',
        serial: 'serial',
        speaker: 'speaker',
        syncScript: 'sync-script',
        syncXhr: 'sync-xhr',
        unoptimizedImages: 'unoptimized-images',
        unoptimizedLosslessImages: 'unoptimized-lossless-images',
        unoptimizedLossyImages: 'unoptimized-lossy-images',
        unsizedMedia: 'unsized-media',
        usb: 'usb',
        verticalScroll: 'vertical-scroll',
        vibrate: 'vibrate',
        vr: 'vr',
        wakeLock: 'wake-lock',
        xr: 'xr',
    };
    if (!isPlainObject(options)) {
        throw new Error('featurePolicy must be called with an object argument. See the documentation.');
    }
    var features = options.features;
    if (!isPlainObject(features)) {
        throw new Error('featurePolicy must have a single key, "features", which is an object of features. See the documentation.');
    }
    var result = Object.keys(features).map(function (featureKeyCamelCase) {
        if (!Object.prototype.hasOwnProperty.call(FEATURES, featureKeyCamelCase)) {
            throw new Error("featurePolicy does not support the \"" + featureKeyCamelCase + "\" feature.");
        }
        var featureValue = features[featureKeyCamelCase];
        if (!Array.isArray(featureValue) || featureValue.length === 0) {
            throw new Error("The value of the \"" + featureKeyCamelCase + "\" feature must be a non-empty array.");
        }
        var containsStar = false;
        var containsNone = false;
        featureValue.forEach(function (allowed) {
            if (allowed === '*') {
                containsStar = true;
            }
            else if (allowed === "'none'") {
                containsNone = true;
            }
            else if (allowed === 'self') {
                throw new Error("'self' must be quoted.");
            }
            else if (allowed === 'none') {
                throw new Error("'none' must be quoted.");
            }
        });
        if (featureValue.length > 1) {
            if (containsStar) {
                throw new Error("The value of the \"" + featureKeyCamelCase + "\" feature cannot contain * and other values.");
            }
            else if (containsNone) {
                throw new Error("The value of the \"" + featureKeyCamelCase + "\" feature cannot contain 'none' and other values.");
            }
        }
        var featureKeyDashed = FEATURES[featureKeyCamelCase];
        return [featureKeyDashed].concat(featureValue).join(' ');
    }).join(';');
    if (result.length === 0) {
        throw new Error('At least one feature is required.');
    }
    return result;
}
module.exports = function featurePolicy(options) {
    var headerValue = getHeaderValueFromOptions(options);
    return function featurePolicy(_req, res, next) {
        res.setHeader('Feature-Policy', headerValue);
        next();
    };
};
