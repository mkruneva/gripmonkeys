const path = require('path');

module.exports = {
  entry: './client/static/assets/js/test2.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};