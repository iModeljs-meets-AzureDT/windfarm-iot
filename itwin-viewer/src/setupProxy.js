const { createProxyMiddleware } = require('http-proxy-middleware');

function onProxyReq(proxyReq) {
    proxyReq.removeHeader('Origin');
  }

module.exports = function(app) {
    var express = require('express')
    var router = express.Router()
    module.exports = router;

    app.use(
        createProxyMiddleware('/digitaltwins', {
        target: 'https://windfarm-iot.api.wcus.digitaltwins.azure.net',
        changeOrigin: true,
        headers: {Connection: 'keep-alive'},
        onProxyReq: onProxyReq
        }));
};