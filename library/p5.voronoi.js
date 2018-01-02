
//https://github.com/gorhill/Javascript-Voronoi

(function() {

	var imgWidth;
	var imgHeight;

	var sites = [];

	var nRandoms;

	var voronoiObj = new Voronoi();
	var voronoiDiagram;

	var colors = [];

	var cellStrokeWeight = 1;
	var cellStroke = 0;
	var siteStrokeWeight = 3;
	var siteStroke = 0;

	//Add Random Sites
	p5.prototype.voronoiRndSites = function(n){
		nRandoms = n;
	}

	//Add custom sites
	p5.prototype.voronoiSites = function(newSites){
		for (var i = 0; i < newSites.length; i++) {
			sites.push({x:newSites[i][0],y:newSites[i][1]});
		}
	}

	//Add custom site
	p5.prototype.voronoiSite = function(newSite){
		sites.push({x:newSite[0], y:newSite[1]});
	}

	//Remove custom site
	p5.prototype.voronoiRemoveSite = function(remSite){
		for (var i = 0; i < sites.length; i++) {
			if(sites[i].x == remSite.x && sites[i].y == remSite.y)
				sites = sites.splice(i, 1);
		}
	}

	//Remove all custom sites
	p5.prototype.voronoiClear = function(){
		sites.clear();
	}

	//Get Cell id in position
	p5.prototype.voronoiGetSite = function(x, y){
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {
			//Prepare poly
			var polyVertexes = [];
			for (var j = 0; j < voronoiDiagram.cells[i].halfedges.length; j++) {
				var halfEdge = voronoiDiagram.cells[i].halfedges[j];
				var point = [halfEdge.getStartpoint().x, halfEdge.getStartpoint().y];
				polyVertexes.push(point);
			}
			//Check if inside
			if(insidePoly([x,y],polyVertexes))
				return voronoiDiagram.cells[i].site.voronoiId;
		}
	}

	//Check if point is inside polygon poly
	p5.prototype.insidePoly = function(point, poly){

		var x = point[0], y = point[1];
	    
	    var inside = false;
	    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
	        var xi = poly[i][0], yi = poly[i][1];
	        var xj = poly[j][0], yj = poly[j][1];
	        
	        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect)
	        	inside = !inside;
	    }
	    
	    return inside;
	}

	//Render
	p5.prototype.voronoiDraw = function(x, y){

		//Render Cells
		strokeWeight(cellStrokeWeight);
		stroke(cellStroke);
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {
			beginShape();
			for (var j = 0; j < voronoiDiagram.cells[i].halfedges.length; j++) {
				var halfEdge = voronoiDiagram.cells[i].halfedges[j];
				vertex(x + halfEdge.getStartpoint().x,y + halfEdge.getStartpoint().y);
			}
			endShape(CLOSE);
		}

		//Render Sites
		strokeWeight(siteStrokeWeight);
		stroke(siteStroke);
		for (var i = 0; i < sites.length; i++) {
			point(x + sites[i].x,y + sites[i].y);
		}

	}

	//Compute
	p5.prototype.voronoi = function(width, height){
		//Set Random Sites
		setRandoms(width, height);
		//Compute
		voronoiDiagram = voronoiObj.compute(sites,{xl:0, xr:width, yt:0, yb:height});
	}

	//TODO Add random colors to cells
	p5.prototype.voronoiRandomColors = function(){
		
	}

	//TODO Get voronoi polygons (with neighbors?)
	p5.prototype.voronoiPolys = function(){
		var cells = []
	}

	//Add Random Sites
	function setRandoms(width, height){
		for (var i = 0; i < nRandoms; i++) {
			var nX = round(random(0,width));
			var nY = round(random(0,height));
			sites.push({x:nX, y:nY});
		}
	}

	//Eucledian Distance
	function dist2D(ix, iy, fx, fy){
		return (sqrt(sq(ix - fx)+sq(iy - fy)))
	}

})();