test("paper.js file included", function() {
	ok(paper, "Global paper object in scope");
});


/// setup
var canvas = document.getElementById('testCanvas');
paper.setup(canvas);
///


/*
 * Paper Point Extention Tests
 */
test("Point to JSON", function() {
	var orig = { x: 23, y: 42 };
	
	var pnt = new paper.Point(orig);
	ok(pnt.limJSON, "Point responds to limJSON.");
	
	var jsobj = pnt.limJSON();
	equal(typeof jsobj, "object", "limJSON returns an object.");
	deepEqual(jsobj, orig, "limJSON returns the correct object.")
});


/*
 * Paper Segment Extention Tests
 */
test("Segment to JSON", function() {
	var orig = {
		point: { x: 16, y: 32 },
		handleIn: [-10, -1],
		handleOut: [25, 10]
	};
		
	var seg = new paper.Segment(orig);
	ok(seg.limJSON, "Segment responds to limJSON.");
	
	var jsobj = seg.limJSON();
	equal(typeof jsobj, "object", "limJSON returns an object.");
	deepEqual(jsobj, orig, "limJSON returns the correct object.")
});


/*
 * Paper Path Extention Tests
 */
test("Path to JSON", function() {
	var seg1 = {
		point: { x: 100, y: 50 },
		handleIn: [-80, -100],
		handleOut: [80, 100]
	};
	var seg2 = {
		point: { x: 300, y: 50 },
		handleIn: [-80, -100],
		handleOut: [80, 100]
	};
	var orig = {
		segments: [seg1, seg2],
		strokeWidth: 8,
		strokeColor: [1, 0.1, 0.5],
		strokeCap: "round"
	};
		
	var path = new paper.Path(orig);
	ok(path.limJSON, "Path responds to limJSON.");
	
	var jsobj = path.limJSON();
	equal(typeof jsobj, "object", "limJSON returns an object." );
	deepEqual(jsobj, orig, "limJSON returns the correct object.")
});
