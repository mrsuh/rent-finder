"use strict";

var http = require('http');
var controller = require(__dirname + '/controller/controller.js');
var config = require(__dirname + '/../config/config.js');

function parseCookies(rc) {
    var list = {};

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

var routers = {
    not_found: /^\/404$/i,
    about: /\/about(\?.*|$)/i,
    sitemap: /\/sitemap.xml(\?.*|$)/i,
    statistic: /^\/([^\/]+)\/statistic(\?.*|$)/i,
    list: /^\/([^\/]+)\/(kvartira|komnata)(\?.*|$)/i,
    list_city: /^\/([^\/\?]+)(\/|)(\?.*|$)/i,
    main: /\/(\?.*|$)/i
};

var server = http.createServer(function (req, res) {

    console.log('Request', {'url': req.url});

    switch (true) {
        case null !== req.url.match(routers.not_found):
            controller.not_found(req, res);
            break;
        case null !== req.url.match(routers.about):

            var cookies = parseCookies(req.headers.cookie);

            var city = cookies['city'];
            if ('undefined' === typeof city) {
                city = 'sankt-peterburg';
                res.setHeader('Set-Cookie', 'city=' + city + '; Max-Age=3600; Path=/');
            }

            var realty = cookies['realty'];
            if ('undefined' === typeof realty) {
                realty = 'kvartira';
                res.setHeader('Set-Cookie', 'realty=' + realty + '; Max-Age=3600; Path=/');
            }

            controller.about(req, res, city, realty);
            break;
        case null !== req.url.match(routers.sitemap):
            controller.sitemap(req, res);
            break;
        case null !== req.url.match(routers.statistic):

            var regexp = routers.statistic;
            var match = regexp.exec(req.url);

            var cookies = parseCookies(req.headers.cookie);

            var city = cookies['city'];

            if ('undefined' === typeof city || city !== match[1]) {
                res.setHeader('Set-Cookie', 'city=' + match[1] + '; Max-Age=3600; Path=/');
            }

            var realty = cookies['realty'];
            if ('undefined' === typeof realty) {
                realty = 'kvartira';
                res.setHeader('Set-Cookie', 'realty=' + realty + '; Max-Age=3600; Path=/');
            }

            controller.statistic(req, res, match[1], realty);
            break;
        case null !== req.url.match(routers.list):

            var regexp = routers.list;
            var match = regexp.exec(req.url);

            var cookies = parseCookies(req.headers.cookie);

            if ('undefined' === typeof cookies['city'] || cookies['city'] !== match[1]) {
                res.setHeader('Set-Cookie', 'city=' + match[1] + '; Max-Age=3600; Path=/');
            }

            if ('undefined' === typeof cookies['realty'] || cookies['realty'] !== match[2]) {
                res.setHeader('Set-Cookie', 'realty=' + match[2] + '; Max-Age=3600; Path=/');
            }

            controller.list(req, res, match[1], match[2]);
            break;
        case null !== req.url.match(routers.list_city):

            var regexp = routers.list_city;
            var match = regexp.exec(req.url);

            var cookies = parseCookies(req.headers.cookie);

            if ('undefined' === typeof cookies['city'] || cookies['city'] !== match[1]) {
                res.setHeader('Set-Cookie', 'city=' + match[1] + '; Max-Age=3600; Path=/');
            }

            var realty = 'kvartira';
            if ('undefined' === typeof cookies['realty'] || cookies['realty'] !== realty) {
                res.setHeader('Set-Cookie', 'realty=' + realty + '; Max-Age=3600; Path=/');
            }

            controller.list(req, res, match[1], realty);
            break;
        case null !== req.url.match(routers.main):

            var cookies = parseCookies(req.headers.cookie);

            var city = cookies['city'];
            if ('undefined' === typeof city || !controller.has_city(city)) {
                city = 'sankt-peterburg';
                res.setHeader('Set-Cookie', 'city=' + city + '; Max-Age=3600; Path=/');
            }

            var realty = cookies['realty'];
            if ('undefined' === typeof realty || !controller.has_realty(realty)) {
                realty = 'kvartira';
                res.setHeader('Set-Cookie', 'realty=' + realty + '; Max-Age=3600; Path=/');
            }

            controller.list(req, res, city, realty);
            break;
        default:
            res.writeHead(302, {'Location': '/404'});
            res.end();
            break;
    }
});

server.listen(config.listenPort, config.listenHost, function () {
    console.log('server run', {host: config.listenHost, port: config.listenPort, db: config.databaseUrl});
});