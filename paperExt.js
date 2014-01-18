/*
 * Paper Point Extentions
 */
paper.Point.inject({
	limJSON: function() {
		return { x: this.x, y: this.y };
	},
	rotmod: function(point) {
		return this.modulo(point).add(point).modulo(point);
	}
});


/*
 * Paper Segment Extentions
 */
paper.Segment.inject({
	limJSON: function() {
		return {
			point: this.point.limJSON(),
			handleIn: [this.handleIn.x, this.handleIn.y],
			handleOut: [this.handleOut.x, this.handleOut.y]
		};
	}
});


/*
 * Paper Path Extentions
 */
paper.Path.inject({
	limJSON: function() {
		return {
			segments: this.segments.map(function(seg){
					return seg.limJSON();
				}),
			strokeWidth: this.strokeWidth,
			strokeColor: this.strokeColor.components,
			strokeCap: this.strokeCap
		};
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
		
		this.currentBoard = this.currentBoard.add(this.origin.divide(this.boardSize).floor());
		this.origin = this.origin.rotmod(this.boardSize);
	}
});
