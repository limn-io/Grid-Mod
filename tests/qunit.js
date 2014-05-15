var testrunner = require("qunit");

testrunner.setup({
	log: {
		errors: true,
		summary: true
	}
});

testrunner.run({
	code: "src/gridmod.paper.js",
	tests: "tests/gridmod.paper.test.js"
});
