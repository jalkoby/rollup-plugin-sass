import _regeneratorRuntime from 'babel-runtime/regenerator';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _Object$assign from 'babel-runtime/core-js/object/assign';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import { dirname } from 'path';
import { writeFileSync } from 'fs';
import { renderSync } from 'node-sass';
import { isFunction, isString } from 'util';
import { createFilter } from 'rollup-pluginutils';

/*
 * Create a style tag and append to head tag
 *
 * @param {String} css style
 * @return {String} css style
 */
function insertStyle(css) {
    if (!css) {
        return;
    }

    if (typeof window === 'undefined') {
        return;
    }

    var style = document.createElement('style');

    style.setAttribute('type', 'text/css');
    style.innerHTML = css;

    document.head.appendChild(style);

    return css;
}

function plugin() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var filter = createFilter(options.include || ['**/*.sass', '**/*.scss'], options.exclude || 'node_modules/**');
    var insertFnName = '___$insertStyle';

    return {
        intro: function intro() {
            if (options.insert) {
                return insertStyle.toString().replace(/insertStyle/, insertFnName);
            }
        },
        transform: function transform(code, id) {
            var _this = this;

            return _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
                var paths, sassConfig, css;
                return _regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (filter(id)) {
                                    _context.next = 2;
                                    break;
                                }

                                return _context.abrupt('return', null);

                            case 2:
                                paths = [dirname(id), process.cwd()];
                                sassConfig = _Object$assign({ data: code }, options.options);


                                sassConfig.includePaths = sassConfig.includePaths ? sassConfig.includePaths.concat(paths) : paths;

                                _context.prev = 5;
                                css = renderSync(sassConfig).css.toString();

                                if (!isString(options.output)) {
                                    _context.next = 12;
                                    break;
                                }

                                writeFileSync(options.output, css);

                                code = 'export default "";';
                                _context.next = 19;
                                break;

                            case 12:
                                if (!isFunction(options.output)) {
                                    _context.next = 16;
                                    break;
                                }

                                _context.next = 15;
                                return options.output(css, id);

                            case 15:
                                css = _context.sent;

                            case 16:

                                css = _JSON$stringify(css);

                                if (options.insert) {
                                    css = insertFnName + '(' + css + ')';
                                }

                                code = 'export default ' + css + ';';

                            case 19:
                                return _context.abrupt('return', {
                                    code: code,
                                    map: { mappings: '' }
                                });

                            case 22:
                                _context.prev = 22;
                                _context.t0 = _context['catch'](5);
                                throw _context.t0;

                            case 25:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this, [[5, 22]]);
            }))();
        }
    };
};

export default plugin;