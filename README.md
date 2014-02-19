###Overview

Pattern-Primer-on-Node is a node.js port of Jeremy Keith's [Pattern Primer](https://github.com/adactio/Pattern-Primer), which is written in PHP.

>Create little snippets of markup and save them to the "patterns folder." The pattern primer will generate a list of all the patterns in that folder. You will see the pattern rendered as HTML. You will also get the source displayed in a textarea.

###Installation

You'll need node.js installed (obviously).

    npm install -g connect pattern-primer

###Simple Usage

Place all your HTML extracts into the `<root>/public/patterns` folder. Navigate to the root directory of Pattern-Primer-on-Node and run:

    pattern-primer

You can then navigate to `http://localhost:8080/` to see the output.

###Headless Operation

If you want to generate a 'standalone' version of the primer output, then you can also run the program with the `tofile` switch as follows:

    pattern-primer --tofile

This will place a standalone html file, and a copy of the 'global.css' file located in `<root>/public` and will place them in `<root>/docs`. You should just be able to navigate to that folder and open the index.html file to see the same output.