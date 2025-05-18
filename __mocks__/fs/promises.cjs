// From: https://vitest.dev/guide/mocking.html#example-3
// we can also use `import`, but then
// every export should be explicitly defined

const { fs } = require('memfs')
module.exports = fs.promises
