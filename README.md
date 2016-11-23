# elasticsearch-http-gzip
Makes elasticsearch-js be able to send gzipped POST requests.

Connection handler for sending compressed requests to Elasticsearch
---

``` javascript
var es = require('elasticsearch').Client({
  hosts: 'http://localhost:9200',
  connectionClass: require('elasticsearch-http-gzip'),
  compressedConfig: {
    protocol: 'https'
  },
  suggestCompression: true // enabled this to receive compressed responses from Elasticsearch server
});
``` 

NOTE: It doesn't works with AWS elasticsearch service.
## docker
