const path = require('path');
const srcPath = path.join(__dirname, '/..');

module.exports = {
	entry: "./main.js",
	output: {
		filename: "bundle.js"
	},
	devServer: {
		disableHostCheck: true,
		contentBase: './',
		historyApiFallback: true, 
		port: 8000,
		publicPath: './',
		noInfo: false
	},
	devtool: 'source-map',
	module: {
		loaders:[
			{   test: /\.css$/, 
				loader: 'style-loader!css-loader'
			}]
	}

}