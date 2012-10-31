// doubleunderscore, many functions adapted by Kris Cost
// depends on: underscore.js

(function(){
	var start_time = new Date();

	var root = this;
	var __ = function __ (){};
	var previousDoubleUnderscore = root.__;
	root['__'] = __;

	__.version = 20121001;

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

	// port of Kohana's Arr::path for JavaScript objects
	__.path = (function(){
		function dive (point, index, properties, default_value) {
			var prop_name = properties[index];

			try {
				if (typeof point[prop_name] !== 'undefined') {
					if (index === properties.length-1) {
						return point[prop_name];
					} else {
						return dive(point[prop_name], ++index, properties, default_value);
					};
				} else {
					return default_value;
				};
			} catch (e) {
				return default_value;
			};
		};

		return function(obj, pathstr, dv) {
			return dive(obj, 0, pathstr.split('.'), dv);
		};
	})();

	// adapted from: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
	__.getType = (function(obj) {
		var class_regex = /\s([a-zA-Z]+)/;

		return function(obj){
			return ({}).toString.call(obj).match(class_regex)[1].toLowerCase();
		};
	})();

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
	__.dims = function dims () {
		var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];

		return {
			x: w.innerWidth || e.clientWidth || __.path(g, 'clientWidth', 0),
			y: w.innerHeight || e.clientHeight || __.path(g, 'clientHeight', 0)
		};
	};

	// add generic onLoad events for images and scripts
	__.onLoad = function (element, callback, timeout) {
		var done = false;

		if (__.getType(callback) === 'function') {
			function handler (override) {
				if (override || (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete'))) {
					done = true;

					callback(this);
					__.clearOnLoad(this);
				};
			};

			element.onload = element.onreadystatechange = handler;

			if (timeout) {
				element.timer = setTimeout(function(){
					handler(true);
				}, timeout);
			};
		};

		return element;
	};

	__.clearOnLoad = function (element) {
		element.onload = element.onreadystatechange = null;
		if (element.timer) {
			clearTimeout(element.timer);
			element.timer = null;
		};

		return element;
	};

	// adapted from: http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
	__.addCSS = function addCSS (cssfilename) {
		var cssNode = document.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = cssfilename;
		cssNode.media = 'all';
		document.getElementsByTagName('head')[0].appendChild(cssNode);
	};

	__.addStyle = function addStyle (rules) {
		if (rules && rules.length > 0) {
			var head = document.getElementsByTagName('head')[0];
			var style_element = document.createElement('style');
			style_element.type = 'text/css';

			if (style_element.styleSheet) {
				style_element.styleSheet.cssText = rules.join('\n');
			} else {
				style_element.appendChild(document.createTextNode(rules.join('\n')));
			};

			head.appendChild(style_element);
			return style_element;
		} else {
			return null;
		};
	};

	__.addJS = function addJS (url, callback) {
		var newScript = __.onLoad(document.createElement('script'), callback);
		newScript.type = 'text/javascript';
		newScript.async = true;
		newScript.src = url;
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(newScript, s);
	};

	__.addImage = function (url, callback, tracking, timeout) {
		var newImage = __.onLoad(document.createElement('img'), callback, timeout);
		newImage.src = url;

		if (tracking) {
			newImage.style.display = 'none';
			document.getElementsByTagName('body')[0].appendChild(newImage);
		};

		return newImage;
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
			__.removeEvent(document, 'mousemove', userActionFunction);

			if (timer) {
				clearTimeout(timer);
				timer = null;
			};

			callback();
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

	// returns friendly time difference between 2 Dates
	__.timeDiff = function timeDiff (dateA, dateB) {
		var first_date = null;
		var second_date = null;

		if (dateB) {
			first_date = dateA;
			second_date = dateB;
		} else {
			first_date = new Date();
			second_date = dateA;
		};

		var diff_ms = first_date - second_date;
		var is_positive = (diff_ms > 0);
		diff_ms = Math.abs(diff_ms);

		var seconds_milliseconds = __.divmod(diff_ms, 1000, 'seconds', 'milliseconds');
		var minutes_seconds = __.divmod(seconds_milliseconds.seconds, 60, 'minutes', 'seconds');
		var hours_minutes = __.divmod(minutes_seconds.minutes, 60, 'hours', 'minutes');
		var days_hours = __.divmod(hours_minutes.hours, 24, 'days', 'hours');
		var years_days = __.divmod(days_hours.days, 365, 'years', 'days');

		var verbose = [], suffix = '', short_phrase = '', short_stop = false;

		if (years_days.years > 0) {
			var years_noun =  ' year' + (years_days.years > 1 ? 's' : '');
			short_phrase = verbose[verbose.length] = years_days.years + years_noun;
			short_stop = true;
		};

		if (years_days.days > 0) {
			var day_noun =  ' day' + (years_days.days > 1 ? 's' : '');
			verbose[verbose.length] = years_days.days + day_noun;

			if (!short_stop) {
				short_phrase = days_hours.hours + hour_noun;
				short_stop = true;
			};
		};

		if (days_hours.hours > 0) {
			var hour_noun = ' hour' + (days_hours.hours > 1 ? 's' : '');
			verbose[verbose.length] = days_hours.hours + hour_noun;

			if (!short_stop) {
				short_phrase = days_hours.hours + hour_noun;
				short_stop = true;
			};
		};

		if (hours_minutes.minutes > 0) {
			var minute_noun = ' minute' + (hours_minutes.minutes > 1 ? 's' : '');
			verbose[verbose.length] = hours_minutes.minutes + minute_noun;

			if (!short_stop) {
				short_phrase = hours_minutes.minutes + minute_noun;
				short_stop = true;
			};
		};

		if (minutes_seconds.seconds > 0) {
			var second_noun = ' second' + (minutes_seconds.seconds > 1 ? 's' : '');
			verbose[verbose.length] = minutes_seconds.seconds + second_noun;

			if (!short_stop) {
				short_phrase = minutes_seconds.seconds + second_noun;
				short_stop = true;
			};
		};

		if (seconds_milliseconds.milliseconds > 0) {
			var millisecond_noun = ' millisecond' + (seconds_milliseconds.milliseconds > 1 ? 's' : '');
			verbose[verbose.length] = seconds_milliseconds.milliseconds + millisecond_noun;

			if (!short_stop) {
				short_phrase = 'less than 1 second';
				short_stop = true;
			};
		};

		if (is_positive) {
			suffix = 'ago';
		} else {
			suffix = 'in the future';
		};

		verbose[verbose.length] = suffix;

		return {
			verbose: verbose.join(' '),
			concise: __.sprintf('%s %s', short_phrase, suffix),
			positive: is_positive,
			years: years_days.years,
			days: years_days.days,
			hours: days_hours.hours,
			minutes: hours_minutes.minutes,
			seconds: minutes_seconds.seconds,
			milliseconds: seconds_milliseconds.milliseconds
		};
	};

	__.divmod = function diffmod (dividend, divisor, label1, label2) {
		label1 = label1 || 'quotient';
		label2 = label2 || 'remainder';

		var response = {};
		response[label1] = parseInt(dividend / divisor, 10);
		response[label2] = (dividend % divisor);

		return response;
	};

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



	// Publish Subscribe Pattern, formerly SharedMethods
	// usage:
	// 	1) __.augment(MyNewConstructor, __.PubSubPattern);
	// 	2) MyNewConstructor.prototype = new __.PubSubPattern();
	// 	n) there's other ways...

	__.SharedMethods = __.PubSubPattern = function PubSubPattern (){};

	__.PubSubPattern.prototype.once = function once (eventname, callback) {
		var self = this;

		function wrappedHandler () {
			callback.apply(self, arguments);
			self.off([eventname, wrappedHandler]);
		};

		return self.on(eventname, wrappedHandler);
	};

	__.PubSubPattern.prototype.on = function on (eventname, callback, once) {
		var self = this;

		// It is recommended that your object have a subscriptions object for self-documentation, but the code will detect if you don't and add one.
		if (!self.hasOwnProperty('subscriptions')) {
			self.subscriptions = {};
		};

		if (once) {
			return self.once(eventname, callback);
		};

		if (!self.subscriptions.hasOwnProperty(eventname)) {
			self.subscriptions[eventname] = [];
		};

		self.subscriptions[eventname][self.subscriptions[eventname].length] = callback;
		return [eventname, callback]; // handle
	};

	__.PubSubPattern.prototype.off = function off (handle) {
		var self = this;

		var eventname = handle[0], func = handle[1];

		if (self.subscriptions.hasOwnProperty(eventname)) {
			var callbacks = self.subscriptions[eventname];

			var counter = callbacks.length;
			while (counter--) {
				if (callbacks[counter] === func) {
					self.subscriptions[eventname].splice(counter, 1);
				};
			};
		};
	};

	__.PubSubPattern.prototype._doCallbacks = function _doCallbacks (callbacks, args) {
		var self = this;

		var counter = 0, limit = callbacks.length;
		while (counter < limit) {
			callbacks[counter].apply(self, args.slice(1));
			counter++;
		};
	};

	__.PubSubPattern.prototype.fire = function fire () {
		var self = this;

		var args = _.toArray(arguments);

		if (self.subscriptions.hasOwnProperty('debug')) {
			self._doCallbacks(self.subscriptions['debug'], ['debug'].concat(args));
		};

		if (self.subscriptions.hasOwnProperty(args[0])) {
			self._doCallbacks(self.subscriptions[args[0]], args);
		};

		if (self.global_name) {
			var globalargs = [self.global_name + '_' + args[0], self].concat(args.slice(1));
			__.globalevents.fire.apply(__.globalevents, globalargs);
		};
	};

	// global events

	__.globalevents = new __.PubSubPattern();

	// utility constructors

	__.SerialManager = function SerialManager (max, callback) {
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
		self.args = [];
		self.pos = 0;
		self.end_time = self.time_delta = self.start_time = null;
	};

	__.augment(__.Queue, __.PubSubPattern);

	__.Queue.prototype.add = function add () {
		var self = this;

		var args = _.toArray(arguments);
		self.list[self.list.length] = args[0];
		self.args[self.args.length] = args.slice(1);
	};

	__.Queue.prototype.step = function step () {
		var self = this;

		if (self.pos === 0) {
			self.start_time = new Date();
			self.fire('start');
		} else if (self.pos >= self.list.length) {
			self.end_time = new Date();
			self.time_delta = self.end_time - self.start_time;
			self.fire('end');
			return;
		} else {
			self.fire('step');
		};

		self.pos++;
		self.list[self.pos-1].apply(self, self.args[self.pos-1]);
	};

	__.Poll = function Poll (interval) {
		var self = this;

		self.active = false;
		self.timer = null;
		self.counter = 0;
		self.interval = interval || 0;

		self.subscriptions = {
			start: [],
			loop: [],
			stop: []
		};
	};

	__.augment(__.Poll, __.PubSubPattern);

	__.Poll.prototype.start = function () {
		var self = this;

		if (!self.active) {
			self.active = true;
			self.fire('start');
			self.loop();
		};
	};

	__.Poll.prototype.stop = function () {
		var self = this;

		self.active = false;
		self.fire('stop');
	};

	__.Poll.prototype.loop = function (delay) {
		var self = this;

		if (self.timer) {
			clearTimeout(self.timer);
			self.timer = null;
		};

		if (self.active) {
			if (delay) {
				self.timer = setTimeout(function(){
					self.timer = null;
					self.counter++;
					self.fire('loop');
				}, delay);
			} else if (self.interval > 0) {
				self.timer = setTimeout(function(){
					if (self.active) {
						self.counter++;
						self.fire('loop');

						if (self.active) {
							self.loop();
						};
					};
				}, self.interval);
			} else {
				self.counter++;
				self.fire('loop');
			};
		};
	};

	__.Animation = function Animation (params) {
		var self = this;

		var defaults = {
			start: null,
			stop: null,
			values: [[0, 0]], // [[0, 100], [25, 75, 'easeIn']]
			frames: 0,
			easing: 'linear',
			interval: 0,
			duration: 0,
			frames_second: 77
		};

		_.extend(self.options = {}, defaults, params);

		self.subscriptions = {
			start: [],
			complete: [],
			end: [],
			frame: []
		};

		if (self.options.frames && self.options.interval) {
			self.total_frames = self.options.frames;
			self.poll = new __.Poll(self.options.interval);
		} else {
			self.total_frames = Math.ceil(self.options.frames_second * self.options.duration / 1000)
			self.poll = new __.Poll(Math.ceil(1000 / self.options.frames_second));
		};

		if (__.getType(self.options.start) === 'number' && __.getType(self.options.stop) === 'number') {
			self.values = [[self.options.start, self.options.stop]];
		} else {
			self.values = self.options.values;
		};

		self.reset();

		self.poll.on('loop', function(){
			if (self.active && self.current_frame < self.total_frames) {
				self.current_frame++;

				self.fire.apply(self, ['frame'].concat(self.getFrameValues(self.values, self.current_frame)));

				if (self.current_frame === self.total_frames) {
					self.fire('complete');
				};
			} else {
				self.stop();
			};
		});
	};

	__.augment(__.Animation, __.PubSubPattern);

	__.Animation.prototype.easings = {
		'linear': function(time, total) { return Math.pow(time/total, 1); },
		'easeIn': function(time, total) { return Math.pow(time/total, 3); },
		'easeOut': function(time, total) { return 1 - Math.pow(1 - (time/total), 3); }
	};

	__.Animation.prototype.getFrameValues = function (values, frame) {
		var self = this;

		var counter = 0, limit = values.length, frame_values = [];
		while (counter < limit) {
			var current = values[counter];
			var easing = current[2] || self.options.easing;

			frame_values[frame_values.length] = current[0] + (current[1] - current[0]) * self.easings[easing](frame, self.total_frames);
			counter++;
		};

		return frame_values;
	};

	__.Animation.prototype.start = function () {
		var self = this;

		if (!self.active) {
			self.active = true;
			self.start_time = new Date();
			self.fire('start');

			// apply the "starting" position
			self.fire.apply(self, ['frame'].concat(self.getFrameValues(self.values, 0)));

			self.poll.start();
		};
	};

	__.Animation.prototype.stop = function() {
		var self = this;

		self.stop_time = new Date();
		self.run_time = self.stop_time - self.start_time;

		self.reset();
		self.fire('end');
	};

	__.Animation.prototype.reset = function() {
		var self = this;

		self.active = false;
		self.poll.stop();
		self.current_frame = 0;
	};


	__.Sortable = function Sortable (array, property) {
		var sortable = this;
		sortable.array = array || [];
		sortable.property = property || null;
	};

	// "internal methods"

	__.Sortable.prototype._swap = function _swap (a, b) {
		var tmp = this.array[a];
		this.array[a] = this.array[b];
		this.array[b] = tmp;
	};

	__.Sortable.prototype._partition = function _partition (begin, end, pivot) {
		var piv = this.array[pivot];
		this._swap(pivot, end-1);

		var store = begin;
		var ix = begin;

		while (ix < end-1) {
			switch (typeof this.array[ix][this.property]) {

			case 'string':
				if (this.array[ix][this.property].toLowerCase() <= piv[this.property].toLowerCase()) {
					this._swap(store, ix);
					++store;
				}
			break;

			default:
				if (this.array[ix][this.property] <= piv[this.property]) {
					this._swap(store, ix);
					++store;
				}
			break;

			}; // close switch

			ix++;
		};

		this._swap(end-1, store);
		return store;
	};

	__.Sortable.prototype._qsortByObjectProperty = function _qsortByObjectProperty (begin, end) {
		if (end-1 > begin) {
			var pivot = begin + Math.floor(Math.random()*(end-begin));

			pivot = this._partition(begin, end, pivot);

			this._qsortByObjectProperty(begin, pivot);
			this._qsortByObjectProperty(pivot+1, end);
		};
	};

	__.Sortable.prototype._mergesortByObjectProperty = function _mergesortByObjectProperty (array) {
		if (array.length < 2) { return array; };
		var middle = Math.ceil(array.length/2);
		return this._merge(this._mergesortByObjectProperty(array.slice(0,middle)), this._mergesortByObjectProperty(array.slice(middle)));
	};

	__.Sortable.prototype._merge = function _merge (left, right) {
		var result = new Array();

		while ((left.length > 0) && (right.length > 0)) {
			if (this._mergeComparison(left[0],right[0]) < 0) { result[result.length] = left.shift(); }
			else { result[result.length] = right.shift(); };
		};

		while (left.length > 0) { result[result.length] = left.shift(); };
		while (right.length > 0) { result[result.length] = right.shift(); };
		return result;
	};

	__.Sortable.prototype._mergeComparison = function _mergeComparison (left, right) {
		if (this.property) {
			var leftprop = left[this.property];
			var rightprop = right[this.property];
		} else {
			var leftprop = left;
			var rightprop = right;
		};

		if (leftprop === null) {
			var type = 'string';
		} else {
			var type = typeof leftprop;
		};

		switch (type) {

		case 'string':
			var leftproplower = (leftprop && !this.nsRegex.test(leftprop) ? leftprop.toLowerCase().replace(this.rnsRegex,'') : '\xffff');
			var rightproplower = (rightprop && !this.nsRegex.test(rightprop) ? rightprop.toLowerCase().replace(this.rnsRegex,'') : '\xffff');

			if (leftproplower == rightproplower) { return 0; }
			else if (leftproplower < rightproplower) { return -1; }
			else { return 1; };
		break;

		default:
			if (leftprop == rightprop) { return 0; }
			else if (leftprop < rightprop) { return -1; }
			else { return 1; };
		break;

		}; // close switch
	};

	__.Sortable.prototype.nsRegex = /^\s+$/;
	__.Sortable.prototype.rnsRegex = /^\s+|\s+$/g;

	// "external" methods

	__.Sortable.prototype.sortBy = function sortBy (type, property) {
		var self = this, property_to_sort_by = null;

		if (property) {
			property_to_sort_by = property;
			self.property = property;
		} else if (self.property) {
			property_to_sort_by = self.property;
		};

		if (property_to_sort_by) {
			switch (type) {
			case 'merge':
				self._mergesortByObjectProperty();
			break;

			default:
			case 'qsort':
				self._qsortByObjectProperty(0, self.array.length);
			break;
			};
		};
	};

	__.Sortable.prototype.filter = function filter (dict) {
		var self = this;

		var found_set = [];
		var row_counter = self.array.length;
		while (row_counter--) {
			var current = self.array[row_counter];
			var flag = true;

			for (key in dict) {
				if (dict[key] !== current[key]) {
					flag = false;
					break;
				};
			};

			if (!flag) {
				continue;
			} else {
				found_set[found_set.length] = current;
			};
		};

		return found_set;
	};

	__.Sortable.prototype.search = function search (keywords) {
		var self = this;

		switch (__.getType(keywords)) {
		case 'string':
			var workingkeywords = keywords.match(/\w+/g);
		break;

		case 'array':
			var workingkeywords = keywords;
		break;
		default:
			return [];
		break;
		};

		var wrapped = _.map(workingkeywords, function(item, index, list) { return __.sprintf('(?=.*?%s)', item); });
		var kwregex = new RegExp(__.sprintf('^%s.*$', wrapped.join('')), 'i');

		var found_set = [];
		var row_counter = self.array.length;
		while (row_counter--) {
			var current = self.array[row_counter];
			var blob = [];

			for (key in current) {
				blob[blob.length] = current[key];
			};

			if (kwregex.test(blob.join(' '))) {
				found_set[found_set.length] = current;
			};
		};

		return found_set;
	};

	__.eval_time = new Date() - start_time;
}).call(this);
