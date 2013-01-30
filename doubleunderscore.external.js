(function(__, factory){
	if (__) {
		__.extend(__, factory());
	} else {
		return false;
	};
})(__, function(){
	var __extender  = {};

	// adapted from: https://github.com/samsonjs/strftime - Copyright 2010 - 2011 Sami Samhuri <sami.samhuri@gmail.com>, MIT License
	// usage: __.strftime(format_string, [instance of Date], [run-time locale object], [use UTC boolean]);
	__extender.strftime = (function() {
		function words(s) { return (s || '').split(' '); };

		var DefaultLocale = {
			days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
			shortDays: words('Sun Mon Tue Wed Thu Fri Sat'),
			months: words('January February March April May June July August September October November December'),
			shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
			AM: 'AM',
			PM: 'PM'
		};

		function pad(n, padding) {
			padding = padding || '0';
			return n < 10 ? (padding + n) : n;
		};

		function hours12(d) {
			var hour = d.getHours();
			if (hour == 0) hour = 12;
			else if (hour > 12) hour -= 12;
			return hour;
		};

		function strftime(fmt, d, locale, useUTC) {
			return _strftime(fmt, d, locale, (useUTC || false));
		};

		function getLocalizedStrftime(locale) {
			return function(fmt, d) {
				return strftime(fmt, d, locale);
			};
		};

		// locale is an object with the same structure as DefaultLocale
		function _strftime(fmt, d, locale, _useUTC) {
			// d and locale are optional so check if d is really the locale
			if (d && !(d instanceof Date)) {
				locale = d;
				d = undefined;
			};

			d = d || new Date();
			locale = locale || DefaultLocale;
			locale.formats = locale.formats || {};

			if (_useUTC) {
				d = new Date(d.getTime() + ((d.getTimezoneOffset() || 0) * 60000));
			};

			// Most of the specifiers supported by C's strftime
			return fmt.replace(/%(.)/g, function(_, c) {
				switch (c) {
					case 'A': return locale.days[d.getDay()];
					case 'a': return locale.shortDays[d.getDay()];
					case 'B': return locale.months[d.getMonth()];
					case 'b': // fall through
					case 'h': return locale.shortMonths[d.getMonth()];
					case 'D': return strftime(locale.formats.D || '%m/%d/%y', d, locale);
					case 'd': return pad(d.getDate());
					case 'e': return d.getDate();
					case 'F': return strftime(locale.formats.F || '%Y-%m-%d', d, locale);
					case 'H': return pad(d.getHours());
					case 'I': return pad(hours12(d));
					case 'k': return pad(d.getHours(), ' ');
					case 'l': return pad(hours12(d), ' ');
					case 'M': return pad(d.getMinutes());
					case 'm': return pad(d.getMonth() + 1);
					case 'n': return '\n';
					case 'p': return d.getHours() < 12 ? locale.AM : locale.PM;
					case 'R': return strftime(locale.formats.R || '%H:%M', d, locale);
					case 'r': return strftime(locale.formats.r || '%I:%M:%S %p', d, locale);
					case 'S': return pad(d.getSeconds());
					case 's': return d.getTime();
					case 'T': return strftime(locale.formats.T || '%H:%M:%S', d, locale);
					case 't': return '\t';
					case 'u':
						var day = d.getDay();
						return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week
					case 'v': return strftime(locale.formats.v || '%e-%b-%Y', d, locale);
					case 'w': return d.getDay(); // 0 - 6, Sunday is first day of the week
					case 'Y': return d.getFullYear();
					case 'y':
						var y = String(d.getFullYear());
						return y.slice(y.length - 2);
					case 'Z':
						if (_useUTC) {
							return "GMT";
						}
						else {
							var tz = d.toString().match(/\((\w+)\)/);
							return tz && tz[1] || '';
						}
					case 'z':
						if (_useUTC) {
							return "+0000";
						}
						else {
							var off = d.getTimezoneOffset();
							return (off < 0 ? '-' : '+') + pad(off / 60) + pad(off % 60);
						}
					default: return c;
				};
			});
		};

		return strftime;
	})();

	/**
	sprintf() for JavaScript 0.7-beta1
	http://www.diveintojavascript.com/projects/javascript-sprintf

	Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	    * Neither the name of sprintf() for JavaScript nor the
	      names of its contributors may be used to endorse or promote products
	      derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

	**/

	__extender.sprintf = (function() {
		function get_type(variable) {
			return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
		}
		function str_repeat(input, multiplier) {
			for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
			return output.join('');
		}

		var str_format = function() {
			if (!str_format.cache.hasOwnProperty(arguments[0])) {
				str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
			}
			return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
		};

		str_format.format = function(parse_tree, argv) {
			var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
			for (i = 0; i < tree_length; i++) {
				node_type = get_type(parse_tree[i]);
				if (node_type === 'string') {
					output.push(parse_tree[i]);
				}
				else if (node_type === 'array') {
					match = parse_tree[i]; // convenience purposes only
					if (match[2]) { // keyword argument
						arg = argv[cursor];
						for (k = 0; k < match[2].length; k++) {
							if (!arg.hasOwnProperty(match[2][k])) {
								throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
							}
							arg = arg[match[2][k]];
						}
					}
					else if (match[1]) { // positional argument (explicit)
						arg = argv[match[1]];
					}
					else { // positional argument (implicit)
						arg = argv[cursor++];
					}

					if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
						throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
					}
					switch (match[8]) {
						case 'b': arg = arg.toString(2); break;
						case 'c': arg = String.fromCharCode(arg); break;
						case 'd': arg = parseInt(arg, 10); break;
						case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
						case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
						case 'o': arg = arg.toString(8); break;
						case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
						case 'u': arg = Math.abs(arg); break;
						case 'x': arg = arg.toString(16); break;
						case 'X': arg = arg.toString(16).toUpperCase(); break;
					}
					arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
					pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
					pad_length = match[6] - String(arg).length;
					pad = match[6] ? str_repeat(pad_character, pad_length) : '';
					output.push(match[5] ? arg + pad : pad + arg);
				}
			}
			return output.join('');
		};

		str_format.cache = {};

		str_format.parse = function(fmt) {
			var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
			while (_fmt) {
				if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
					parse_tree.push(match[0]);
				}
				else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
					parse_tree.push('%');
				}
				else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
					if (match[2]) {
						arg_names |= 1;
						var field_list = [], replacement_field = match[2], field_match = [];
						if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
							field_list.push(field_match[1]);
							while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
								if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
									field_list.push(field_match[1]);
								}
								else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
									field_list.push(field_match[1]);
								}
								else {
									throw('[sprintf] huh?');
								}
							}
						}
						else {
							throw('[sprintf] huh?');
						}
						match[2] = field_list;
					}
					else {
						arg_names |= 2;
					}
					if (arg_names === 3) {
						throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
					}
					parse_tree.push(match);
				}
				else {
					throw('[sprintf] huh?');
				}
				_fmt = _fmt.substring(match[0].length);
			}
			return parse_tree;
		};

		return str_format;
	})();

	__extender.vsprintf = function(fmt, argv) {
		argv.unshift(fmt);
		return __.sprintf.apply(null, argv);
	};


	/*!
	* Cookies.js - 0.2.1
	* Thursday, October 18 2012 @ 8:18 PM EST
	*
	* Copyright (c) 2012, Scott Hamper
	* Licensed under the MIT license,
	* http://www.opensource.org/licenses/MIT
	*/

	// modified to work in this context

	__extender.cookies = (function (document, undefined) {
		'use strict';

		var Cookies = function (key, value, options) {
			return arguments.length === 1 ? Cookies.get(key) : Cookies.set(key, value, options);
		};

		Cookies.get = function (key) {
			if (document.cookie !== Cookies._cacheString) {
				Cookies._populateCache();
			}

			return Cookies._cache[key];
		};

		Cookies.defaults = {
			path: '/'
		};

		Cookies.set = function (key, value, options) {
			var options = {
				path: options && options.path || Cookies.defaults.path,
				domain: options && options.domain || Cookies.defaults.domain,
				expires: options && options.expires || Cookies.defaults.expires,
				secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
			};

			if (value === undefined) {
				options.expires = -1;
			}

			switch (typeof options.expires) {
				// If a number is passed in, make it work like 'max-age'
				case 'number': options.expires = new Date(new Date().getTime() + options.expires * 1000); break;
				// Allow multiple string formats for dates
				case 'string': options.expires = new Date(options.expires); break;
			}

			// Escape only the characters that should be escaped as defined by RFC6265
			var cookieString = encodeURIComponent(key) + '=' + (value + '').replace(/[^!#-+\--:<-\[\]-~]/g, encodeURIComponent);
			cookieString += options.path ? ';path=' + options.path : '';
			cookieString += options.domain ? ';domain=' + options.domain : '';
			cookieString += options.expires ? ';expires=' + options.expires.toGMTString() : '';
			cookieString += options.secure ? ';secure' : '';

			document.cookie = cookieString;

			return Cookies;
		};

		Cookies.expire = function (key, options) {
			return Cookies.set(key, undefined, options);
		};

		Cookies._populateCache = function () {
			Cookies._cache = {};
			Cookies._cacheString = document.cookie;

			var cookiesArray = Cookies._cacheString.split('; ');
			for (var i = 0; i < cookiesArray.length; i++) {
				// The cookie value can contain a '=', so cannot use 'split'
				var separatorIndex = cookiesArray[i].indexOf('=');
				var key = decodeURIComponent(cookiesArray[i].substr(0, separatorIndex));
				var value = decodeURIComponent(cookiesArray[i].substr(separatorIndex + 1));

				// The first instance of a key in the document.cookie string
				// is the most locally scoped cookie with the specified key.
				// The value of this key will be sent to the web server, so we'll
				// just ignore any other instances of the key.
				if (Cookies._cache[key] === undefined) {
					Cookies._cache[key] = value;
				}
			}
		};

		Cookies.enabled = (function () {
			var isEnabled = Cookies.set('cookies.js', '1').get('cookies.js') === '1';
			Cookies.expire('cookies.js');
			return isEnabled;
		})();

		return Cookies;
	})(document);

	return __extender;
});
