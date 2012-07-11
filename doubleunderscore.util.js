// doubleunderscore, many functions adapted by Kris Cost
// depends on: underscore.js
(function(){
	var root = this;
	var __ = function __ (){};
	var previousDoubleUnderscore = root.__;
	root['__'] = __;

	__.version = 20120705;

	__.noConflict = function(){
		root.__ = previousDoubleUnderscore;
		return this;
	};

	__.getRandomInt = function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	__.getRandomItem = function getRandomItem (array) {
		return array[__.getRandomInt(0, array.length-1)];
	};

	__.check = function check (value) {
		return !(value === null || value === void 0 || value === '' || value === [] || value === false);
	};

	__.fibonacci = _.memoize(function fibonacci (n) {
		return n < 2 ? n : __.fibonacci(n - 1) + __.fibonacci(n - 2);
	});

	// adapted from: http://stackoverflow.com/questions/901115/get-querystring-values-with-jquery/2880929#2880929
	__.queryParams = (function gatherQueryParams () {
		var working = {};

		var e,
		a = /\+/g,
		r = /([^&;=]+)=?([^&;]*)/g,
		d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
		q = window.location.search.substring(1);

		while (e = r.exec(q)) {
			working[d(e[1])] = d(e[2]);
		};

		return working;
	})();

	__.getMeta = function getMeta (target_document) {
		var target_document = target_document || document;
		var heads = target_document.getElementsByTagName('head');

		if (heads) {
			var metas = heads[0].getElementsByTagName('meta');
		} else {
			return {};
		};

		var meta_hash = {}, counter = metas.length;
		while (counter--) {
			var current = metas[counter];
			if (current.getAttribute('content')) {
				var key = current.getAttribute('property') || current.getAttribute('name') || current.getAttribute('content');
				meta_hash[key] = current.getAttribute('content');
			};
		};

		return meta_hash;
	};

	// standardized browser window dimensions
	var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];
	__.x = w.innerWidth || e.clientWidth || g.clientWidth;
	__.y = w.innerHeight || e.clientHeight || g.clientHeight;

	// adapted from: http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
	__.addCSS = function addCSS (cssfilename) {
		var cssNode = document.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = cssfilename;
		cssNode.media = 'all';
		document.getElementsByTagName('head')[0].appendChild(cssNode);
	};

	__.addJS = function addJS (url, callback) {
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.async = true;
		var done = false;

		if (callback) {
			newScript.onload = newScript.onreadystatechange = function(){
				if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
					done = true;

					// Handle memory leak in IE
					newScript.onload = newScript.onreadystatechange = null;
					callback(this);
				};
			};
		};

		newScript.src = url;
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(newScript, s);
	};

	// converts arrays of 2-property objects into single object: [{ name: 'a', value: 1 }, { name: 'b', value: 2 }] => { a: 1, b: 2 } 
	__.dict = function dict (array) {
		var counter = array.length, response = {};
		while (counter--) {
			var current = array[counter];
			response[current.name] = current.value;
		};

		return response;
	};

	// adapted from: Pro Javascript Design Patterns
	__.augment = function augment (receivingClass, givingClass, methods) {
		if (methods) {
			var counter = methods.length;
			while (counter--){
				receivingClass.prototype[methods[counter]] = givingClass.prototype[methods[counter]];
			};
		} else {
			for (var methodName in givingClass.prototype) {
				receivingClass.prototype[methodName] = givingClass.prototype[methodName];
			};
		};
	};

	// port of Kohana's Arr::path for JavaScript objects
	__.path = function path (obj, pathstr, default_value) {
		var properties = pathstr.split('.');

		function dive (point, index) {
			var prop_name = properties[index];

			try {
				if (typeof point[prop_name] !== 'undefined') {
					if (index === properties.length-1) {
						return point[prop_name];
					} else {
						return dive(point[prop_name], ++index);
					};
				} else {
					return default_value;
				};
			} catch (e) {
				return default_value;
			};
		};

		return dive(obj, 0);
	};

	// adapted from: http://ejohn.org/projects/flexible-javascript-events/
	__.addEvent = function addEvent (element, type, callback) {
		if (element.attachEvent) {
			element['e' + type + callback] = callback;
			element[type + callback] = function(){
				element['e' + type + callback](window.event);
			};

			element.attachEvent('on' + type, element[type + callback] );
		} else {
			element.addEventListener(type, callback, false);
		};
	};

	__.removeEvent = function removeEvent (element, type, callback) {
		if (element.detachEvent) {
			element.detachEvent('on' + type, element[type + callback]);
    			element[type + callback] = null;
		} else {
			element.removeEventListener(type, callback, false);
		};
	};

	// userAction

	__.onUserAction = function (callback, timeout) {
		var timer = null;

		if (timeout) {
			timer = setTimeout(userActionFunction, timeout);
		};

		__.addEvent(document, 'mousemove', userActionFunction);

		function userActionFunction () {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			};

			callback();
			__.removeEvent(document, 'mousemove', userActionFunction);
		};
	};

	// adapted from: underscore.js; added compile-time template settings, try/catch, removed 'with' usage
	__.template = (function template () {
		var defaults = {
			evaluate: /\[!([\s\S]+?)!\]/g,
			interpolate: /\[!=([\s\S]+?)!\]/g,
			varname: 'dt'
		};

		var template = function template (str, templatesettings) {
			var c = {};
			_.extend(c, defaults, templatesettings);

			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
			'__p.push(\'' +
			str.replace(/\\/g, '\\\\')
			.replace(/'/g, "\\'")
			.replace(c.interpolate, function(match, code) { return "'," + code.replace(/\\'/g, "'") + ",'"; })
			.replace(c.evaluate || null, function(match, code) { return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('"; })
			.replace(/\r/g, '\\r')
			.replace(/\n/g, '\\n')
			.replace(/\t/g, '\\t')
			+ "');return __p.join('');";

			try {
				return new Function(c.varname, tmpl);
			} catch (e) {
				throw e;
			};
		};

		return template;
	})();

	// adapted from: https://github.com/samsonjs/strftime - Copyright 2010 - 2011 Sami Samhuri <sami.samhuri@gmail.com>, MIT License
	// usage: __.strftime(format_string, [instance of Date], [run-time locale object], [use UTC boolean]);
	__.strftime = (function() {
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

	__.sprintf = (function() {
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

	__.vsprintf = function(fmt, argv) {
		argv.unshift(fmt);
		return __.sprintf.apply(null, argv);
	};

	// shared prototype methods

	__.SharedMethods = function(){};

	__.SharedMethods.prototype.on = function on (eventname, callback, once) {
		var self = this;

		if (self.subscriptions.hasOwnProperty(eventname)) {
			callback.once = once || false;
			self.subscriptions[eventname][self.subscriptions[eventname].length] = callback;
		};
	};

	__.SharedMethods.prototype.fire = function fire () {
		var self = this;

		var args = _.toArray(arguments);
		var callbacks = self.subscriptions[args[0]];

		var counter = 0, limit = callbacks.length, newlist = [];
		while (counter < limit) {
			var callback = callbacks[counter];
			callback.apply(self, args.slice(1));

			if (!callback.once) {
				newlist[newlist.length] = callback;
			};

			counter++;
		};

		self.subscriptions[args[0]] = newlist;
	};



	// utility constructors

	__.SerialManager = function (max, callback) {
		var self = this;

		self.max = max;
		self.counter = 0;
		self.callback = callback;
		self.data = {};
	};

	__.SerialManager.prototype.bump = function (label, data) {
		var self = this;

		if (typeof label !== 'undefined') {
			self.data[label] = data;
		};

		if (++self.counter >= self.max) {
			self.callback(self.data);
		};
	};

	__.SerialManager.prototype.execute = function (data) {
		self.callback(data);
	};


	__.Queue = function Queue () {
		var self = this;

		self.subscriptions = {
			start: [],
			step: [],
			end: []
		};

		self.list = [];
		self.pos = 0;
	};

	__.Queue.prototype = new __.SharedMethods();

	__.Queue.prototype.add = function add (func) {
		var self = this;

		self.list[self.list.length] = func;
	};

	__.Queue.prototype.step = function step () {
		var self = this;

		if (self.pos === 0) {
			self.fire('start');
		} else if (self.pos >= self.list.length-1) {
			self.fire('end');
			return;
		} else {
			self.fire('step');
		};

		self.list[self.pos++].call(self);
	};

}).call(this);
