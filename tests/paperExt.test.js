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


/*
 * Limn Layer Extention Tests
 */
test("Layer Move", function() {
	var pnt = new paper.Point({ x: 50, y: 100 });
	var path = new paper.Path(pnt);
	
	var lar = new LimnLayer(path);
	ok(lar.move, "Layer responds to move.");
	
	var offset = new paper.Point({ x: -10, y: -30 });
	lar.move(offset);
	
	var pntAfter = new paper.Point(lar.children[0].segments[0].point)
	deepEqual(pntAfter, new paper.Point({x: 40, y: 70}), "Position of child objects correct after move");
});

test("Move Changes Board Origin. (no negatives)", function() {
	var lar = new LimnLayer();
	
	ok(lar.origin, "Layer has 'origin' property.");
	deepEqual(lar.origin, new paper.Point(0, 0), "Initial origin of 0,0.");
	
	var mv1 = new paper.Point({ x: 10, y: 30 });
	lar.move(mv1);
	deepEqual(lar.origin, mv1, "Origin after first move is equal to distance moved.");
	
	var mv2 = new paper.Point({ x: 50, y: 90 });
	lar.move(mv2);
	deepEqual(lar.origin, mv1.add(mv2), "Origin after all moves is equal to sum of moves.");
});

test("Move Changes Current Board", function() {
	var lar = new LimnLayer();
	
	ok(lar.currentBoard, "Layer has 'currentBoard' property.");
	ok(lar.boardSize, "Layer has 'boardSize' property.");
	
	deepEqual(lar.currentBoard, new paper.Point(0, 0), "Initial board of 0,0.");
	deepEqual(lar.boardSize, new paper.Point(2000, 2000), "Initial board  size of 2000.");
	
	var mv1 = new paper.Point({ x: 10, y: 30 });
	lar.move(mv1);
	deepEqual(lar.currentBoard, new paper.Point(0, 0), "Board does not change if within bounds.");
	
	var mv2 = new paper.Point({ x: -30, y: -30 });
	lar.move(mv2);
	deepEqual(lar.currentBoard, new paper.Point(-1, 0), "Negative move changes to previous board.");
	deepEqual(lar.origin, new paper.Point(1980, 0), "Origin loops to boardSize on move.");
	
	var mv3 = new paper.Point({ x: 0, y: 7000 });
	lar.move(mv3);
	deepEqual(lar.currentBoard, new paper.Point(-1, 3), "Current board correct after muliboard move.");
	deepEqual(lar.origin, new paper.Point(1980, 1000), "Origin correct after muliboard move.");

	var mv4 = new paper.Point();
	lar.move(mv4);
	deepEqual(lar.currentBoard, new paper.Point(-1, 3), "Zero move doesn't change board.");
	deepEqual(lar.origin, new paper.Point(1980, 1000), "Zero move doesn't change origin.");
	
	var mv5 = new paper.Point(20, -7000);
	lar.move(mv5);
	deepEqual(lar.currentBoard, new paper.Point(0, 0), "Move back to starting board.");
	deepEqual(lar.origin, new paper.Point(0, 0), "Move back to origin.");
});
