const webpack = require('webpack');
const dotenv = require('dotenv');
const { join, resolve } = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

dotenv.config({
    path: resolve(__dirname, '../.env'),
});

module.exports = (env) => {
    const isProduction = env.production === 'true' || process.env.NODE_ENV === 'production';
    const publicPath = env.publicPath || process.env.PUBLIC_PATH || '/';

    const sourcePath = resolve(__dirname, '../src');
    const buildPath = resolve(__dirname, '../dist');

    const extractCSSTextPlugin = new ExtractTextPlugin({
        filename: 'vendors.css',
        disable: !isProduction,
        ignoreOrder: true,
    });
    const extractStylusTextPlugin = new ExtractTextPlugin({
        filename: 'style.css',
        disable: !isProduction,
        ignoreOrder: true,
    });

    const defaultConfig = {
        entry: {
            app: isProduction ? './index.client.ts' : [
                'react-hot-loader/patch',
                'webpack/hot/dev-server',
                'webpack-hot-middleware/client?reload=true&noInfo=true',
                './index.client.ts',
            ],
            vendors: [
                'react',
                'react-dom',
                'redux',
                'react-redux',
                'react-router',
            ],
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        context: sourcePath,
        target: 'web',
        resolve: {
            modules: [ 'node_modules' ],
            extensions: [
                '.ts', '.tsx',
                '.js', '.jsx',
                '.json',
            ],
        },
        output: {
            path: join(buildPath, publicPath),
            publicPath,
            filename: '[name].client.js',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: isProduction ? [{
                        loader: 'awesome-typescript-loader',
                        options: {
                            module: 'es6',
                        },
                    }] : [
                        'react-hot-loader/webpack',
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                module: 'es6',
                            },
                        },
                    ],
                },
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    use: [{
                        loader: 'tslint-loader',
                        options: {
                            emitErrors: true,
                        },
                    }],
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    use: [ 'source-map-loader' ],
                },
                {
                    test: /\.styl$/,
                    use: extractStylusTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: true,
                                    sourceMap: true,
                                    importLoaders: 1,
                                    minimize: isProduction,
                                },
                            },
                            'stylus-loader',
                        ],
                    }),
                },
                {
                    test: /\.css$/,
                    use: extractCSSTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1,
                                    minimize: isProduction,
                                },
                            },
                        ],
                    }),
                },
                {
                    test: /\.(jpe?g|png|svg|gif|eot|ttf|woff|woff2)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    }],
                },
            ],
        },
    };

    const plugins = [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(isProduction ? 'production' : 'development'),
            __DEV__: !isProduction,
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.client.js',
            minChunks: Infinity,
        }),
        extractCSSTextPlugin,
        extractStylusTextPlugin,
    ];

    if (!isProduction) {
        plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
        );
    } else {
        plugins.push(
            new UglifyJSPlugin({
                uglifyOptions: {
                    warnings: true,
                },
            }),

        );
    }

    return Object.assign({}, defaultConfig, {
        plugins,
    });
};