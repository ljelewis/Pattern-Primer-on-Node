#!/usr/bin/env node

/*jslint nomen: true */
'use strict';

var settings = {
		webserverport : '8080',
		wwwroot: 'public',
		pattern_path: 'public/patterns',
		sourcehtmlfile: 'source.html',
		tofile_outputpath: 'docs'
	},
	util = require('util'),
	connect = require('connect'),

	primer = function (serverResponse, tofile, tofileCallback) {
		tofile = tofile || false;

		var fs = require('fs'),
			patternFolder = './' + settings.pattern_path,
			simpleEscaper = function (text) {
				return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
			},
			outputPatterns = function (patterns) {
				fs.readFile(settings.sourcehtmlfile, 'utf-8', function (err, content) {
					if (err !== null) {
						util.puts('There was an error when trying to read file:', 'source.html');
						return;
					}

					var i,
						l,
						file;

					for (i = 0, l = patterns.length; i < l; i += 1) {
						content += outputPattern(patterns[i]);
					}

					content += '</body></html>';

					if (tofile) {
						tofileCallback(content);
					} else {
						serverResponse.end(content);
					}
				});
			},
			getPatternBlurbFileName = function(fileName) {
				return fileName.substr(0, fileName.length - 5) + '.blurb.html';
			},
			outputPatternBlurb = function(patternFile) {
				var blurbFileName = getPatternBlurbFileName(patternFile.filename);
				if(!fs.existsSync(patternFolder + '/' + blurbFileName)) {
					return '';
				}

				return '<div class="pattern-blurb">' +
					fs.readFileSync(patternFolder + '/' + blurbFileName, 'utf-8') + '</div>';
			},
			outputPatternHeadingText = function(patternFile) {
				var name = patternFile.filename
					.substring(0, patternFile.filename.length - 5)
					.split(/-|\./g)
					.join(' ');

				return name.substring(0, 1).toUpperCase() + name.substring(1);
			},
			outputPatternHeading = function(patternFile) {
				return '<h3 class="pattern-heading">' + outputPatternHeadingText(patternFile) + '</h3>';
			},
			outputPattern = function(patternFile) {
				var content = '';
				content += '<div class="pattern"><div class="display">';
				content += outputPatternHeading(patternFile);
				content += outputPatternBlurb(patternFile);
				content += patternFile.content;
			    content += '</div><div class="source"><textarea rows="6" cols="30">';
			    content += simpleEscaper(patternFile.content);
			    content += '</textarea>';
				if (!tofile) {
					content += '<p><a href="patterns/' + patternFile.filename + '">' + patternFile.filename + '</a></p>';
				}
				content += '</div></div>';

				return content;
			},
			handleFiles = function (files) {
				// This was asyncronous, but we need the file names, which we can't get from the callback of 'readFile'
				var patterns = files.map(function(file) {
					return {
						filename: file,
						content: fs.readFileSync(patternFolder + '/' + file, 'utf-8')
					};
				});

				outputPatterns(patterns);
			},
			beginProcess = function () {
				fs.readdir(patternFolder, function (err, contents) {
					if (err !== null && err.code === 'ENOENT') {
						util.puts('Cannot find patterns folder:', patternFolder);
						return;
					}

					var files = contents.filter(function(item) {
						return item.substr(-5) === '.html' && item.substr(-10, 5) !== 'blurb';
					});

					handleFiles(files);
				});
			};

		beginProcess();
	},
	server = connect.createServer(
		connect.static(__dirname + '/' + settings.wwwroot),
		function (req, resp) {
			if (req.url !== '/') {
				resp.writeHead(404, {
					'Content-Length': 0,
					'Content-Type': 'text/plain'
				});
				resp.end();
				return;
			}

			primer(resp);
		}
	);

if (process.argv[2] === '--tofile') {

	primer(null, true, function (content) {
		var fs = require('fs');
		fs.writeFile('./' + settings.tofile_outputpath + '/index.html', content, 'utf-8', function (err) {
			if (err !== null && err.code === 'ENOENT') {
				util.puts('Cannot find patterns folder:', settings.tofile_outputpath);
				return;
			}
			fs.createReadStream('./' + settings.wwwroot + '/global.css').pipe(fs.createWriteStream('./' + settings.tofile_outputpath + '/global.css'));
			util.puts('Stand-alone output can now be found in "' + settings.tofile_outputpath + '/"');
		});
	});

} else {

	server.listen(settings.webserverport);
	util.puts('You can now visit http://localhost:' + settings.webserverport + '/ to see your patterns.');
	util.puts('To kill this server, just press Ctrl + C');

}