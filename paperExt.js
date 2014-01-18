/*
 * Paper Point Extentions
 */
paper.Point.inject({
	limJSON: function() {
		return { x: this.x, y: this.y };
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
