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
	deepEqual(lar.currentBoard, new paper.Point(1, 0), "Negative move changes to previous board.");
	deepEqual(lar.origin, new paper.Point(1980, 0), "Origin loops to boardSize on move.");
	
	var mv3 = new paper.Point({ x: 0, y: 7000 });
	lar.move(mv3);
	deepEqual(lar.currentBoard, new paper.Point(1, -3), "Current board correct after muliboard move.");
	deepEqual(lar.origin, new paper.Point(1980, 1000), "Origin correct after muliboard move.");

	var mv4 = new paper.Point();
	lar.move(mv4);
	deepEqual(lar.currentBoard, new paper.Point(1, -3), "Zero move doesn't change board.");
	deepEqual(lar.origin, new paper.Point(1980, 1000), "Zero move doesn't change origin.");
	
	var mv5 = new paper.Point(20, -7000);
	lar.move(mv5);
	deepEqual(lar.currentBoard, new paper.Point(0, 0), "Move back to starting board.");
	deepEqual(lar.origin, new paper.Point(0, 0), "Move back to origin.");
});

test("Paths Export Relative To Layer Origin. (Within same board.)", function() {
	var orig = { x: 110, y: 220 };
	var pnt = new paper.Point(orig);
	var path = new paper.Path(pnt);
	var gp = new paper.Group(path);
	
	var lar = new LimnLayer({
		children: [gp],
		strokeColor: 'black',
	});
	
	deepEqual(path.limJSON().segments[0].point, orig, "Relative position retained with no move.")
	
	var mv1 = new paper.Point(100, 400);
	lar.move(mv1);
	
	deepEqual(path.limJSON().segments[0].point, orig, "Relative position retained after move.")
});

/*
 * Paper Group Extention Tests
 */
test("Group Tracks Its Offset", function() {
	var gp = new paper.Group();
	ok(gp.board, "Group has 'board' property.");
	deepEqual(gp.board, new paper.Point(0, 0), "Initial board ID of 0,0.");
	
	gp.board = new paper.Point(-3, 2);
	
	var lar = new LimnLayer({
		children: [gp],
		strokeColor: 'black',
	});
		
	var mv1 = new paper.Point(6000, -4000);
	lar.move(mv1);
	
	deepEqual(gp.board, new paper.Point(-3, 2), "Board mantains ID regardless of position.");
	
	ok(gp.offset, "Group responds to offset getter.");
	equal(typeof gp.offset, "object", "Group offset returns an object.");
	
	deepEqual(gp.offset, new paper.Point(), "No offset if on the same board.");
	
	var mv2 = new paper.Point(-6000, 2000);
	lar.move(mv2);
	
	deepEqual(gp.offset, new paper.Point(-3, 1), "Board offset equal to distance between ID and current.");
});

test("Paths Export Relative To The Board They Were Drawn.", function() {
	var orig = { x: 110, y: 220 };
	var pnt = new paper.Point(orig);
	var path = new paper.Path(pnt);
	var gp = new paper.Group(path);
	
	var lar = new LimnLayer({
		children: [gp],
		strokeColor: 'black',
	});
	
	deepEqual(path.limJSON().segments[0].point, orig, "Relative position retained with no move.")
	
	var mv1 = new paper.Point(-100, -4000);
	lar.move(mv1);
	
	deepEqual(path.limJSON().segments[0].point, orig, "Relative position retained after move.")
});


/*
 * limn Board Import Tests
 */
test("Segment Import With Offset.", function() {
	var pnt = { x: 100, y: 50 }
	var seg = {
		point: pnt,
		handleIn: [-80, -100],
		handleOut: [80, 100]
	};
	
	var segment = new paper.Segment();
	
	ok(segment.importWithOffset, "Segment responds to 'importWithOffset'.");
	
	var zeroimport = segment.importWithOffset(seg, new paper.Point());
	deepEqual(zeroimport, new paper.Segment(seg), "Correct import with no offset.")
	
	var offimport = segment.importWithOffset(seg, new paper.Point(200, 50));
	deepEqual(new paper.Point(offimport.point), new paper.Point(300, 100), "Correct import with offset.")
});

test("Path Import With Offset Compensation", function() {
	var pnt = { x: 100, y: 50 }
	var seg = {
		point: pnt,
		handleIn: [-80, -100],
		handleOut: [80, 100]
	};
	var path = {
		segments: [seg],
		strokeWidth: 8,
		strokeColor: [1, 0.1, 0.5],
		strokeCap: "round"
	};
	
	var p = new paper.Path();
	ok(p.importWithOffset, "Path responds to 'importWithOffset'.");
	
	var zeroimport = p.importWithOffset(path, new paper.Point())
	deepEqual(zeroimport.exportJSON(), (new paper.Path(path)).exportJSON(), "Correct import with no offset.")
	
	var offimport = p.importWithOffset(path, new paper.Point(200, 50));
	deepEqual(new paper.Point(offimport.segments[0].point), new paper.Point(300, 100), "Correct import with offset.")
});

test("Board Initialization", function() {
	var lar = new LimnLayer();
	lar.origin = new paper.Point(100);
	
	var pnt = { x: 100, y: 50 }
	var seg = {
		point: pnt,
		handleIn: [-80, -100],
		handleOut: [80, 100]
	};
	var path = {
		segments: [seg],
		strokeWidth: 8,
		strokeColor: [1, 0.1, 0.5],
		strokeCap: "round"
	};
	var group = {
		boardID: { x: 1, y: -2 },
		children: [path]
	}
	
	var gp = new paper.Group();
	ok(gp.initBoard, "Group responds to 'initBoard'.");
	
	gp = gp.initBoard(group);
	deepEqual(gp.board, new paper.Point(1, -2), "Board ID set from import object.");
	ok(gp.children[0], "Group contains a path after import.");
	
	equal(lar.children.length, 1, "Layer has one child.");
	deepEqual(lar.children[0], gp, "Layer child is group.");
	
	
	var mv2 = new paper.Point(-2000, 4000);
	lar.move(mv2);
	deepEqual(new paper.Point(gp.children[0].segments[0].point), new paper.Point(200, 150), "Group contains correct point after import.")
});


/*
 * limn Group Item Add Tests
 */
test("Group Item Add", function() {
	var lar = new LimnLayer();
	
	var gp = new paper.Group();
	gp.board = new paper.Point(1, 2);
	
	var path = new paper.Path({
		segments: [{
			point: new paper.Point(100, 50),
		}],
		strokeWidth: 8,
		strokeColor: [1, 0.1, 0.5],
		strokeCap: "round"
	});
	
	gp.addChild(path);
	deepEqual(new paper.Point(path.segments[0].point), new paper.Point(100, 50), "Imported path in same global location.");
	
	gp.addChildWithOffset(path);
	deepEqual(new paper.Point(path.segments[0].point), new paper.Point(2100, 4050), "Imported path relative to board group.");
});


/*
 * limn Layer Board Manipulation Tests
 */
test("Get and Remove Board By ID", function() {
	var gp = new paper.Group();
	gp.board = new paper.Point(1, 2);
	
	var gp2 = new paper.Group();
	gp2.board = new paper.Point(5, 1);
	
	var lar = new LimnLayer({
		children: [gp],
		strokeColor: 'black',
	});
	
	ok(lar.board, "Layer responds to board request.");
	
	deepEqual(lar.board(new paper.Point(0)), null, "Return null for non-existant group.");
	
	deepEqual(lar.board(new paper.Point(1, 2)), gp, "Return child group with correct id.");
	
	lar.addChildren([new paper.Path(), gp2]);
	deepEqual(lar.board(new paper.Point(5, 1)), gp2, "Ignores paper items without 'board' attribute.");
	
	lar.board(new paper.Point(5, 1)).remove();
	deepEqual(lar.board(new paper.Point(5, 1)), null, "Able to remove board after selection.");
	
});
