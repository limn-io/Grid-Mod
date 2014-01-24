/*
 * Paper Point Extentions
 */
paper.Point.inject({
	limJSON: function(origin) {
		var origin = origin? origin : new paper.Point();
		var tmp = this.subtract(origin);
		return { x: tmp.x, y: tmp.y };
	},
	rotmod: function(point) {
		return this.modulo(point).add(point).modulo(point);
	}
});


/*
 * Paper Segment Extentions
 */
paper.Segment.inject({
	limJSON: function(origin) {
		var origin = origin? origin : new paper.Point();
		return {
			point: this.point.limJSON(origin),
			handleIn: [this.handleIn.x, this.handleIn.y],
			handleOut: [this.handleOut.x, this.handleOut.y]
		};
	},
	importWithOffset: function(seg, offset) {
		return new paper.Segment({
			point: offset.add( new paper.Point(seg.point) ),
			handleIn: seg.handleIn,
			handleOut: seg.handleOut
		});
	},
});


/*
 * Paper Path Extentions
 */
paper.Path.inject({
	limJSON: function() {
		var origin = this.layer.origin? this.layer.origin : new paper.Point();
		
		if(typeof this.parent.parent !== "undefined") {
			origin = origin.add( this.parent.offset.multiply(this.layer.boardSize) );
		}
		
		return {
			segments: this.segments.map(function(seg){
					return seg.limJSON(origin);
				}),
			strokeWidth: this.strokeWidth,
			strokeColor: this.strokeColor.components,
			strokeCap: this.strokeCap
		};
	},
	importWithOffset: function(path, offset) {
		this.segments = path.segments.map(function(seg){
			return (new paper.Segment()).importWithOffset(seg, offset);
		});
		this.strokeWidth = path.strokeWidth;
		this.strokeColor = path.strokeColor;
		this.strokeCap = path.strokeCap;
		
		return this;
	},
});


/*
 * Paper Group Extentions
 */
paper.Group.inject({
	board: new paper.Point(),
	getOffset: function() {
		return this.board.subtract(this.layer.currentBoard);
	},
	initBoard: function(newBoard) {
		var bid = new paper.Point(newBoard.boardID)
		var offset = bid.subtract(this.layer.currentBoard).multiply(this.layer.boardSize)
			.add(this.layer.origin);
		
		this.board = bid;
		this.children = newBoard.children.map(function(path){
			return (new paper.Path()).importWithOffset(path, offset);
		});
		
		return this;
	}
});


/*
 * Paper Layer Extentions
 */
var LimnLayer = paper.Layer.extend({
	origin: new paper.Point(),
	currentBoard: new paper.Point(),
	boardSize: new paper.Point(2000),
	move: function(delta) {
		this.translate(delta);
		this.origin = this.origin.add(delta);
		
		this.currentBoard = this.currentBoard.subtract(this.origin.divide(this.boardSize).floor());
		this.origin = this.origin.rotmod(this.boardSize);
	}
});
