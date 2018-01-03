
//https://github.com/gorhill/Javascript-Voronoi

var voronoiDiagram;

const VOR_CELLDRAW_BOUNDED = 1;
const VOR_CELLDRAW_VERTEX = 2;
const VOR_CELLDRAW_SITE = 3;

(function() {

	var imgWidth;
	var imgHeight;

	var sites = [];

	var nRandoms;
	var randomMinimumDist = 0;

	var voronoiObj = new Voronoi();

	var colors = [];

	var cellStrokeWeight = 1;
	var cellStroke = 0;
	var siteStrokeWeight = 3;
	var siteStroke = 0;

	/*
	Add Random Sites
	- Can set minimum distance between randoms
	- If not set, old value is preserved
	*/
	p5.prototype.voronoiRndSites = function(n, newMinimum){
		nRandoms = n;
		if(newMinimum !== undefined)
			randomMinimumDist = newMinimum;		
	}

	/*
	Set random minimum distance
	- Minimum distance includes distance to custom sites
	*/
	p5.prototype.voronoiRndMinDist = function(newMinimum){
		randomMinimumDist = newMinimum;				
	}

	/*
	Add custom sites
	- newSites format is [[5,5],[10,10],[15,15],[20,20]]
	*/
	p5.prototype.voronoiSites = function(newSites){
		for (var i = 0; i < newSites.length; i++) {
			sites.push({x:newSites[i][0],y:newSites[i][1]});
		}
	}

	/*
	Add custom site
	//TODO Possibility to add color
	*/
	p5.prototype.voronoiSite = function(nx, ny){
		sites.push({x:nx, y:ny});
	}

	/*
	Remove custom site
	- remSite format is [x,y]
	*/
	p5.prototype.voronoiRemoveSite = function(dx, dy){
		for (var i = 0; i < sites.length; i++) {
			if(sites[i].x == dx && sites[i].y == dy){
				sites.splice(i, 1);
				return;
			}
		}
	}

	//Remove all custom sites
	p5.prototype.voronoiClearSites = function(){
		sites = [];
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

	//Check if point is inside polygon
	function insidePoly(point, poly){

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

	//Add Random Sites
	function setRandoms(width, height){
		for (var i = 0; i < nRandoms; i++) {
			var flag;
			var nX = round(random(0,width));
			var nY = round(random(0,height));
			var triesLimit = 500;
			var tries = 0;
			if (randomMinimumDist > 0) {
				do{
					flag = false;
					nX = round(random(0,width));
					nY = round(random(0,height));
					for (var j = 0; j < sites.length; j++) {
						if(dist2D(nX, nY, sites[j].x, sites[j].y) < randomMinimumDist)
							flag = true;
					}
					tries++;
				}while(flag == true && tries <= triesLimit)
			}
			sites.push({x:nX, y:nY});
			//Warn about maximum tries reached
			if (tries >= triesLimit)
				console.log("Warning: setRandoms tries limit reached: minimum distance(" + randomMinimumDist + ") might be too big for size/number of sites");
		}
	}

	//TODO Get voronoi cell neighbors
	p5.prototype.voronoiNeighbors = function(id){

	}

	//TODO Draw a voronoi Cell
	p5.prototype.voronoiDrawCell = function(x, y, id, type){
		var halfedges = voronoiDiagram.cells[id].halfedges;
		if (type == VOR_CELLDRAW_BOUNDED) {
			drawCellBounded(x, y, halfedges);
		}else if(type == VOR_CELLDRAW_VERTEX){

		}else if(type == VOR_CELLDRAW_SITE){

		}
	}

	//Draw Cell Bounded
	function drawCellBounded(x, y, halfedges){

		//Stroke Settings
		strokeWeight(cellStrokeWeight);
		stroke(cellStroke);

		//Find minimums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		for (var i = 0; i < halfedges.length; i++) {
			if (halfedges[i].getStartpoint().x < minX)
				minX = halfedges[i].getStartpoint().x;
			if (halfedges[i].getStartpoint().y < minY)
				minY = halfedges[i].getStartpoint().y;
		}

		//Draw
		beginShape();
		for (var i = 0; i < halfedges.length; i++) {
			vertex(halfedges[i].getStartpoint().x - minX + x, halfedges[i].getStartpoint().y - minY + y);
		}
		endShape(CLOSE);

	}

	//Eucledian Distance
	function dist2D(ix, iy, fx, fy){
		return (sqrt(sq(ix - fx)+sq(iy - fy)))
	}

})();