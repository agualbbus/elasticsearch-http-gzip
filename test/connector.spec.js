const test = require('tape')

const es = require('elasticsearch').Client({
  hosts: 'http://localhost:9200',
  connectionClass: require('../connector-es6'),
  compressedConfig: {
    protocol: 'http'
  }
})


test('It should POST index to elasticsearch', t => {
  es.index({
    index: 'tests',
    id: Math.floor((Math.random() * 10000) + 1),
    type: 'test',
    body: { test : 'testing'}
  })
  .then((result) => {
    console.log(result)
    t.end()
  })

})
