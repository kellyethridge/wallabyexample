var System;
var Promise;

module.exports = function (wallaby) {
    return {
        files: [
          { pattern: "jspm_packages/**/*.js", instrument: false },
          { pattern: "config.js", instrument: false },
          { pattern: "app/**/*.ts", load: false, instrument: true },
        ],
        tests: [
            { pattern: "tests/**/*-tests.ts", load: false, instrument: true }
        ],
        hints: {
            ignoreCoverage: "ignore coverage"
        },
        compilers: {
            "**/*.ts": wallaby.compilers.typeScript({
                module: "amd",
                target: "es5",
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                noImplicitAny: false,
                removeComments: false
                // TypeScript compiler specific options
                // See interface CompilerOptions in
                // https://github.com/Microsoft/TypeScript/blob/master/src/compiler/types.ts
            })
            //postprocessor: WallabyPostprocessor
            //preprocessors: [{
            //    '**/*.js': file => require("babel-core")
            //        .transform(file.content, {
            //            sourceMap: true,
            //            compact: false,
            //            presets: ["es2015"]
            //        })

            //}]
        },

        env: {
            kind: "electron"
        },
        testFramework: "jasmine",

        middleware: (app, express) => {
            app.use("/jspm_packages", express.static(require("path").join(__dirname, "jspm_packages")));
        },

        bootstrap: function (w) {
            w.delayStart();

            System.config({
                baseUrl: '/',
                paths: {
                    '*': "*.js",
                    "github:*": "/jspm_packages/github/*",
                    "npm:*": "/jspm_packages/npm/*"
                }
            });

            var promises = [];

            for (var i = 0, len = w.tests.length; i < len; i++) {
                promises.push(System["import"](w.tests[i].replace(/\.js$/, "")));
            }

            Promise.all(promises).then(function () {
                w.start();
            });
        },
        debug: false
    };
};
