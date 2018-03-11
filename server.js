
'use strict'
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const open = require('open');
let isInitialCompilation = true;
const compiler = webpack(config);

new WebpackDevServer(compiler, config.devServer)
.listen(8000, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:' + config.port);
});

compiler.plugin('done', () => {
  if (isInitialCompilation) {
    setTimeout(() => {
      console.log('\n✓ The bundle is now ready for serving!\n');
    }, 350);
  }
  isInitialCompilation = false;
});
