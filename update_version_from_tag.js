const fs = require('fs');
const packageJSON = require('./package.json');

const args = process.argv.slice(2);

if (!args[0]) {
  console.error('version argument was not passed. exiting.');
  process.exit(1);
}

packageJSON.version = args[0];

fs.writeFileSync('./package.json', JSON.stringify(packageJSON, null, 2));
