
/* 
MIT License

Copyright (c) 2018 Francisco Moreira

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const VOR_CELLDRAW_BOUNDED = 1;
const VOR_CELLDRAW_CENTER = 2;
const VOR_CELLDRAW_SITE = 3;

(function() {

	var imgWidth;
	var imgHeight;

	var voronoiDiagram;

	var sites = [];
	var cells = [];

	var notFirst = false;
	var nRandoms;
	var randomMinimumDist = 0;

	var voronoiObj = new Voronoi();

	var cellColors = [];

	var cellStrokeWeight = 1;
	var cellStroke = 0;
	var siteStrokeWeight = 3;
	var siteStroke = 0;

	var drawSites = true;

	var jitterStepMax = 20;
	var jitterStepMin = 5;
	var jitterFactor = 3;
	var jitterBorderFlag = false;
	var jitterCells = [];

	/*
	Set cell stroke weight
	*/
	p5.prototype.voronoiCellStrokeWeight = function(w){
		if(w >= 0)
			cellStrokeWeight = w;
	}

	/*
	Set site stroke weight
	*/
	p5.prototype.voronoiSiteStrokeWeight = function(w){
		if(w >= 0)
			siteStrokeWeight = w;
	}

	/*
	Set cell stroke
	*/
	p5.prototype.voronoiCellStroke = function(c){
		cellStroke = c;
	}

	/*
	Set site stroke
	*/
	p5.prototype.voronoiSiteStroke = function(c){
		siteStroke = c;
	}

	/*
	Set flag to draw sites or not
	*/
	p5.prototype.voronoiSiteFlag = function(b){
		drawSites = b;
	}

	/*
	Add Random Sites
	*/
	p5.prototype.voronoiRndSites = function(n, newMinimum){
		nRandoms = n;
		if(newMinimum !== undefined)
			randomMinimumDist = newMinimum;
	}

	/*
	Set random minimum distance
	*/
	p5.prototype.voronoiRndMinDist = function(newMinimum){
		randomMinimumDist = newMinimum;
	}

	/*
	Add custom sites
	*/
	p5.prototype.voronoiSites = function(newSites){
		for (var i = 0; i < newSites.length; i++) {
			sites.push({x:newSites[i][0],y:newSites[i][1]});
			if(newSites[i][2] !== undefined)
				cellColors.push([newSites[i][0],newSites[i][1],newSites[i][2]]);
			else
				cellColors.push([newSites[i][0],newSites[i][1],color(random(0,255),random(0,255),random(0,255))]);
			}
	}

	/*
	Add custom site
	*/
	p5.prototype.voronoiSite = function(nx, ny, nColor){
		sites.push({x:nx, y:ny});
		if(nColor !== undefined)
			cellColors.push([nx,ny,nColor]);
		else
			cellColors.push([nx,ny,color(random(0,255),random(0,255),random(0,255))]);
	}

	/*
	Remove custom site by index "dx" or by coordinates "dx,dy"
	*/
	p5.prototype.voronoiRemoveSite = function(dx, dy){

		if(dy === undefined){
			//Delete by id
			sites.splice(dx, 1);
		}else{
			//Delete by coordinates
			for (var i = 0; i < sites.length; i++) {
				if(sites[i].x == dx && sites[i].y == dy){
					sites.splice(i, 1);
					return;
				}
			}
		}
	}

	/*
	Remove all custom sites
	*/
	p5.prototype.voronoiClearSites = function(){
		cellColors = [];
		sites = [];
	}

	/*
	Get Cell id in position
	*/
	p5.prototype.voronoiGetSite = function(x, y, jitter = false){

		//Default to normal cells
		var target = cells;

		//Get Site with Jitter instead
		if(jitter){
			//Detect if jitter structure is not empty
			if(jitterCells.length !== 0){
				target = jitterCells;
			}else{
				console.log("voronoiGetSite: Jitter was not generated, using normal diagram");
			}
		}

		//For each cell
		for (var i = 0; i < target.length; i++) {
			if(raycast([x, y], target[i]))
				return i;
		}

	}

	/*
	Raycast
	https://github.com/substack/point-in-polygon
	*/
	function raycast (point, vs) {
    
		var x = point[0], y = point[1];

		var inside = false;
		for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			var xi = vs[i][0], yi = vs[i][1];
			var xj = vs[j][0], yj = vs[j][1];
		
			var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

			if (intersect){
				inside = !inside;
			}
		}

		return inside;

	};

	/*
	Compute
	*/
	p5.prototype.voronoi = function(width, height, jitterFlag = false){
		//Recycle diagram
		voronoiObj.recycle(voronoiDiagram);

		//Remove Old Randoms
		if(notFirst)
			sites.splice(sites.length-nRandoms,nRandoms);

		//Set Diagram Size
		imgWidth = width;
		imgHeight = height;

		//Set Random Sites
		setRandoms(width, height);

		//Compute
		voronoiDiagram = voronoiObj.compute(sites,{xl:0, xr:width, yt:0, yb:height});

		//Simplify Cells structure
		simplifyCells();

		//Create Jitter
		jitterCells = [];
		if(jitterFlag)
			jitter();

		//First instance
		if(!notFirst)
			notFirst = true;
	}

	/*
	Simplify Gorhill structure to cells
	*/
	function simplifyCells(){
		cells = [];
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {
			var vertices = [];
			for (var j = 0; j < voronoiDiagram.cells[i].halfedges.length; j++) {
				vertices.push([voronoiDiagram.cells[i].halfedges[j].getStartpoint().x, voronoiDiagram.cells[i].halfedges[j].getStartpoint().y]);
			}
			cells.push(vertices);
		}
	}

	/*
	Returns Diagram for more advanced uses
	*/
	p5.prototype.voronoiGetDiagram = function(){
		return voronoiDiagram;
	}

	/*
	Returns simplified cells for more advanced use
	*/
	p5.prototype.voronoiGetCells = function(){
		return cells;
	}

	/*
	Add Random Sites
	*/
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

			//Set Color
			cellColors.push([nX,nY,color(random(0,255),random(0,255),random(0,255))]);

			//Warn about maximum tries reached
			if (tries >= triesLimit)
				console.log("Warning: setRandoms tries limit reached: minimum distance(" + randomMinimumDist + ") not ensured");
		}
	}

	/*
	Eucledian Distance
	*/
	function dist2D(ix, iy, fx, fy){
		return (sqrt(sq(ix - fx)+sq(iy - fy)))
	}

	/*
	Get voronoi cell neighbors
	*/
	p5.prototype.voronoiNeighbors = function(id){

		if(id >= voronoiDiagram.cells.length || id === undefined)
			return;

		//All neighbors
		var allNeighbors = [];
		for (var i = 0; i < voronoiDiagram.cells[id].halfedges.length; i++) {
			if(voronoiDiagram.cells[id].halfedges[i].edge.rSite !== null)
				allNeighbors.push(voronoiDiagram.cells[id].halfedges[i].edge.rSite.voronoiId);
			allNeighbors.push(voronoiDiagram.cells[id].halfedges[i].edge.lSite.voronoiId);
		}

		//Remove duplicates
		var uniqueNeighbors = removeDuplicates(allNeighbors);

		//Remove itself
		for (var i = 0; i < uniqueNeighbors.length; i++) {
			if(uniqueNeighbors[i] == id){
				uniqueNeighbors.splice(i,1);
				break;
			}
		}

		return uniqueNeighbors;
	}

	/*
	Remove duplicates in array
	*/
	function removeDuplicates(arr){
	    let unique_array = []
	    for(let i = 0;i < arr.length; i++){
	        if(unique_array.indexOf(arr[i]) == -1){
	            unique_array.push(arr[i])
	        }
	    }
	    return unique_array;
	}

	/*
	Draw a voronoi Cell
	*/
	p5.prototype.voronoiDrawCell = function(x, y, id, type, fill = false, jitter = false){

		if(id >= voronoiDiagram.cells.length || id === undefined)
			return;

		var halfedges = voronoiDiagram.cells[id].halfedges;
		var siteX = voronoiDiagram.cells[id].site.x;
		var siteY = voronoiDiagram.cells[id].site.y;

		push();

		//Load Color
		setFillColorCell(id);

		//Check fill flag
		if(!fill)
			noFill();

		//Default to normal cells
		var target = cells;

		//Draw Jitter instead
		if(jitter){
			//Detect if jitter structure is not empty
			if(jitterCells.length !== 0){
				target = jitterCells;
			}else{
				console.log("voronoiDrawCell: Jitter was not generated, using normal diagram");
			}
		}

		//Choose draw mode
		if (type == VOR_CELLDRAW_BOUNDED) {
			drawCellBounded(x, y, id, siteX, siteY, jitter, target);			
		}else if(type == VOR_CELLDRAW_CENTER){
			drawCellCenter(x, y, id, siteX, siteY, jitter, target);
		}else if(type == VOR_CELLDRAW_SITE){
			drawCellSite(x, y, id, siteX, siteY, jitter, target);
		}

	}

	/*
	Draw Cell Bounded
	*/
	function drawCellBounded(x, y, id, siteX, siteY, jitter, target){

		//Stroke Settings
		strokeWeight(cellStrokeWeight);
		stroke(cellStroke);

		//Find minimums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		for (var i = 0; i < target[id].length; i++) {
			if (target[id][i][0] < minX)
				minX = target[id][i][0];
			if (target[id][i][1] < minY)
				minY = target[id][i][1];
		}

		//Draw
		beginShape();
		for (var i = 0; i < target[id].length; i++) {
			vertex(target[id][i][0] - minX + x, target[id][i][1] - minY + y);
		}
		endShape(CLOSE);

		//Draw Site
		if(drawSites){
			strokeWeight(siteStrokeWeight);
			stroke(siteStroke);
			point(siteX - minX + x, siteY - minY + y);
		}

		pop();

	}

	/*
	Draw Cell Centered
	*/
	function drawCellCenter(x, y, id, siteX, siteY, jitter, target){

		//Stroke Settings
		strokeWeight(cellStrokeWeight);
		stroke(cellStroke);

		//Find minimums and maximums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		let maxX = 0;
		let maxY = 0;
		for (var i = 0; i < target[id].length; i++) {
			if (target[id][i][0] < minX)
				minX = target[id][i][0];
			if (target[id][i][1] < minY)
				minY = target[id][i][1];
			if (target[id][i][0] > maxX)
				maxX = target[id][i][0];
			if (target[id][i][1] > maxY)
				maxY = target[id][i][1];
		}

		let dX = maxX - minX;
		let dY = maxY - minY;

		//Draw
		beginShape();
		for (var i = 0; i < target[id].length; i++) {
			vertex(target[id][i][0] - minX + x - dX/2, target[id][i][1] - minY + y - dY/2);
		}
		endShape(CLOSE);

		//Draw Site
		if(drawSites){
			strokeWeight(siteStrokeWeight);
			stroke(siteStroke);
			point(siteX - minX + x-dX/2, siteY - minY + y-dY/2);
		}

		pop();

	}

	/*
	Draw Cell Site
	*/
	function drawCellSite(x, y, id, siteX, siteY, jitter, target){

		//Stroke Settings
		strokeWeight(cellStrokeWeight);
		stroke(cellStroke);

		//Find minimums and maximums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		for (var i = 0; i < target[id].length; i++) {
			if (target[id][i][0] < minX)
				minX = target[id][i][0];
			if (target[id][i][1] < minY)
				minY = target[id][i][1];
		}

		//Draw
		beginShape();
		for (var i = 0; i < target[id].length; i++) {
			vertex(target[id][i][0] - minX + x - (siteX-minX), target[id][i][1] - minY + y - (siteY-minY));
		}
		endShape(CLOSE);

		//Draw Site
		if(drawSites){
			strokeWeight(siteStrokeWeight);
			stroke(siteStroke);
			point(siteX - minX + x-(siteX-minX), siteY - minY + y-(siteY-minY));
		}

		pop();

	}

	/*
	Draw Diagram
	*/
	p5.prototype.voronoiDraw = function(x, y, fill = true, jitter = false){

		//Default to normal cells
		var target = cells;

		//Draw Jitter instead
		if(jitter){
			//Detect if jitter structure is not empty
			if(jitterCells.length !== 0){
				target = jitterCells;
			}else{
				console.log("voronoiDraw: Jitter was not generated, using normal diagram");
			}
		}

		push();

		//Draw Frame only
		if(!fill)
			noFill();

		//Render Cells
		for (var i = 0; i < target.length; i++) {

			strokeWeight(cellStrokeWeight);
			stroke(cellStroke);

			//Load Color
			if(fill)
				setFillColorCell(i);

			//Shape
			beginShape();
			for (var j = 0; j < target[i].length; j++) {
				vertex(target[i][j][0] + x, target[i][j][1] + y);
			}
			endShape(CLOSE);

			//Render Site
			if(drawSites){
				strokeWeight(siteStrokeWeight);
				stroke(siteStroke);
				let sX = x + voronoiDiagram.cells[i].site.x;
				let sY = y + voronoiDiagram.cells[i].site.y;
				point(sX,sY);
			}
		}

		pop();

	}

	/*
	Set fill color from cell
	*/
	function setFillColorCell(cellId){
		let color = voronoiGetColor(cellId);
		fill(color);
	}

	/*
	Get color of cell id
	*/
	p5.prototype.voronoiGetColor = function(cellId){
		for (var c = 0; c < cellColors.length; c++) {
			if(cellColors[c][0] == voronoiDiagram.cells[cellId].site.x && cellColors[c][1] == voronoiDiagram.cells[cellId].site.y){
				return cellColors[c][2];
			}
		}
	}

	/*
	Set Jitter step Max
	*/
	p5.prototype.voronoiJitterStepMax = function(s){
		if(s >= 0)
			jitterStepMax = s;
	}

	/*
	Set Jitter step Min
	*/
	p5.prototype.voronoiJitterStepMin = function(s){
		if(s >= 0)
			jitterStepMin = s;
	}

	/*
	Set Jitter factor
	*/
	p5.prototype.voronoiJitterFactor = function(f){
		jitterFactor = f;
	}
	
	/*
	Set Jitter border flag
	*/
	p5.prototype.voronoiJitterBorder = function(f){
		jitterBorderFlag = f;
	}
	
	/*
	Get the edges with jitter
	*/
	p5.prototype.voronoiGetCellsJitter = function(f){
		if(jitterCells.length !== 0){
			return jitterCells;
		}else{
			console.log("voronoiGetCellsJitter: Jitter was not generated, using normal diagram");
			return cells;
		}
	}

	/*
	Creates jittered version of cells
	*/
	function jitter(){
		var edgeMemory = [];
		//For each cell
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {
			var vertices = [];
			//For each edge
			for (var j = 0; j < voronoiDiagram.cells[i].halfedges.length; j++) {
				const edge = voronoiDiagram.cells[i].halfedges[j];
				//Detect diagram edge
				if(!jitterBorderFlag){
					if((round(edge.getStartpoint().x) == 0 && (round(edge.getEndpoint().x) == 0)) ||
						(round(edge.getStartpoint().y) == 0 && (round(edge.getEndpoint().y) == 0)) ||
						(round(edge.getStartpoint().x) == imgWidth && (round(edge.getEndpoint().x) == imgWidth))||
						(round(edge.getStartpoint().y) == imgHeight && (round(edge.getEndpoint().y) == imgHeight))){
						vertices.push([edge.getStartpoint().x, edge.getStartpoint().y]);
						continue;
					}
				}
				//Look for edge in memory
				var found = false;
				var id = 0;
				for (var e = 0; e < edgeMemory.length; e++) {
					//Found flipped
					if(edgeMemory[e][0].getEndpoint() === edge.getStartpoint() &&
					 edgeMemory[e][0].getStartpoint() === edge.getEndpoint()){
						found = true;
						id = e;
						break;
					}
				}
				//If found flipped -> flipped copy
				if(found){
					for (var e = edgeMemory[id][1].length-1; e > 0; e--) {
						vertices.push(edgeMemory[id][1][e]);
					}
				}
				//If not found do jitter
				else{
					jitterEdge(vertices, edge, edgeMemory);
				}
			}
			jitterCells.push(vertices);
		}

	}

	/*
	Jitter edge and add to vertices list
	*/
	function jitterEdge(vertices, edge, edgeMemory){

		//Edge info to save
		memEdge = [];

		//Edge Details					
		const dX = edge.getEndpoint().x - edge.getStartpoint().x;
		const dY = edge.getEndpoint().y - edge.getStartpoint().y;
		const delta = createVector(dX, dY);
		const deltaNorm = delta.copy(); deltaNorm.normalize();
		const deltaMag = delta.mag();
		const perpendicularNorm = deltaNorm.copy(); perpendicularNorm.rotate(HALF_PI);
		let start = createVector(edge.getStartpoint().x, edge.getStartpoint().y);
		let pos = start.copy();
		let jitterVal = 0;

		//Add first edge vertice
		vertices.push([start.x,start.y]);
		memEdge.push([start.x,start.y]);

		//Jitter Vertices
		var total = random(jitterStepMin,jitterStepMax+1);
		while(total < deltaMag){
			//Advance pos
			pos = p5.Vector.add(start, p5.Vector.mult(deltaNorm, total));
			//Jitter Perpendicularly
			jitterVal = (random(0,201)-100)/100;
			jitterVal *= jitterFactor;
			pos.add(p5.Vector.mult(perpendicularNorm, jitterVal));
			//Add vertice
			vertices.push([pos.x,pos.y]);
			memEdge.push([pos.x,pos.y]);
			//Advance
			total += random(jitterStepMin,jitterStepMax+1);
		}

		//Add to edge memory
		memEdge.push([edge.getEndpoint().x, edge.getEndpoint().y]);
		edgeMemory.push([edge, memEdge]);

	}

})();