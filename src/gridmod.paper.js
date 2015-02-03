/*!
 * Copyright (c) 2014 Neil Vallon (http://limn.io)
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

// Check for node
if(typeof window === 'undefined') {
	var paper = require("paper");
}

/*
 * Paper Point Extentions
 */
paper.Point.inject({
	toGMON: function(origin) {
		var origin = origin? origin : new paper.Point();
		var tmp = this.add(origin);
		return { x: tmp.x, y: tmp.y };
	},
	rotmod: function(point) {
		return this.modulo(point).add(point).modulo(point);
	},
	inSet: function(pntSet) {
		for(var i = 0; i < pntSet.length; i++) {
			if(this.equals(pntSet[i])) {
				return i;
			}
		}
		return -1;
	}
});


/*
 * Paper Segment Extentions
 */
paper.Segment.inject({
	toGMON: function(origin) {
		var origin = origin? origin : new paper.Point();
		var tmp = {
			point: this.point.toGMON(origin),
		};
		
		if(!this.handleIn.isZero()){
			tmp.handleIn = [this.handleIn.x, this.handleIn.y];
		}
		if(!this.handleOut.isZero()){
			tmp.handleOut = [this.handleOut.x, this.handleOut.y];
		}
		return tmp;
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
	toGMON: function() {
		var origin = this.layer.origin? this.layer.origin : new paper.Point();
		
		if(typeof this.parent.parent !== "undefined") {
			origin = origin.subtract( this.parent.offset.multiply(this.layer.boardSize) );
		}
		
		return {
			segments: this.segments.map(function(seg){
				return seg.toGMON(origin);
			}),
			strokeWidth: this.strokeWidth,
			strokeColor: this.strokeColor.components.map(function(s) {
				return Math.floor(s*255); // float 0-1 => int 0-255
			}),
		};
	},
	importWithOffset: function(path, offset) {
		this.segments = path.segments.map(function(seg){
			return (new paper.Segment()).importWithOffset(seg, offset);
		});
		this.strokeWidth = path.strokeWidth;
		this.strokeColor = path.strokeColor.map(function(s) {
			return s/255;  // int 0-255 => float 0-1
		});
		this.strokeCap = "round";

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
	addChildWithOffset: function(child) {
		child.position = this.offset.multiply(this.layer.boardSize)
			.subtract(this.layer.origin)
			.add(child.position);
			
		this.addChild(child);
		return this;
	},
	initBoard: function(newBoard) {
		var bid = new paper.Point(newBoard.boardID)
		var offset = bid.subtract(this.layer.currentBoard).multiply(this.layer.boardSize)
			.subtract(this.layer.origin);
		
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
GMLayer = paper.Layer.extend({
	origin: new paper.Point(),
	currentBoard: new paper.Point(),
	boardSize: new paper.Point(1000),
	move: function(delta) {
		this.translate(delta);
		this.origin = this.origin.subtract(delta);
		
		this.currentBoard = this.currentBoard.add(this.origin.divide(this.boardSize).floor());
		this.origin = this.origin.rotmod(this.boardSize);
	},
	board: function(bID) {
		for(var i = 0; i < this.children.length; i++){
			if(this.children[i].board !== undefined && this.children[i].board.equals(bID)){
				return this.children[i];
			}
		}
		
		return null;
	},
	boardSet: function() {
		var s = [];
		for(var i = 0; i < this.children.length; i++) {
			var id = this.children[i].board;
			if(id !== undefined) {
				s.push(id);
			}
		}
		return s;
	}
});
