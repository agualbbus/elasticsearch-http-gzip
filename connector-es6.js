/**
 * A Connection handler for making gzipped http POST request
 *
 * Uses node's zlib to compress request body
 * Define the Amazon ES config and the connection handler
 * in the client configuration:
 *
 * var es = require('elasticsearch').Client({
 *  hosts: 'https://amazon-es-host.us-east-1.es.amazonaws.com',
 *  connectionClass: require('elasticsearch-http-gzip'),
 *  compressedConfig: {
 *    protocol: 'https'
 *  },
 * });
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @class HttpConnector
 */
const HttpConnector = require('elasticsearch/src/lib/connectors/http')
const _ = require('elasticsearch/src/lib/utils')
const zlib = require('zlib')

class HttpCompressedConnector extends HttpConnector {

  constructor (host, config) {
    super(host, config)
    this.http = require(config.compressedConfig.protocol)
  }

  request (params, cb) {
    let incoming
    let timeoutId
    let request
    let req
    let status = 0
    let headers = {}
    let log = this.log
    let response

    const reqParams = this.makeReqParams(params)

    const cleanUp = _.bind(function (err) {
      clearTimeout(timeoutId)

      req && req.removeAllListeners()
      incoming && incoming.removeAllListeners()

      if ((err instanceof Error) === false) {
        err = void 0
      }

      log.trace(params.method, reqParams, params.body, response, status)
      if (err) {
        cb(err)
      } else {
        cb(err, response, status, headers)
      }
    }, this)

    request = this.http.request(reqParams, function (_incoming) {
      incoming = _incoming
      status = incoming.statusCode
      headers = incoming.headers
      response = ''

      let encoding = (headers['content-encoding'] || '').toLowerCase()
      if (encoding === 'gzip' || encoding === 'deflate') {
        incoming = incoming.pipe(zlib.createUnzip())
      }

      incoming.setEncoding('utf8')
      incoming.on('data', function (d) {
        response += d
      })

      incoming.on('error', cleanUp)
      incoming.on('end', cleanUp)
    })

    request.on('error', cleanUp)

    request.setNoDelay(true)
    request.setSocketKeepAlive(true)

    if (params.body) {
      const body = zlib.gzipSync(params.body)
      request.setHeader('Content-Length', Buffer.byteLength(body))
      request.setHeader('Content-Encoding', 'gzip')
      request.write(body)
      request.end()
    } else {
      request.setHeader('Content-Length', 0)
      request.end()
    }

    return function () {
      request.abort()
    }
  }
}

module.exports = HttpCompressedConnector
