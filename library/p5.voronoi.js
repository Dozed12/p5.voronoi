
/*

Gorhill implementation

https://github.com/gorhill/Javascript-Voronoi

*/

var voronoiDiagram;

const VOR_CELLDRAW_BOUNDED = 1;
const VOR_CELLDRAW_CENTER = 2;
const VOR_CELLDRAW_SITE = 3;

(function() {

	var imgWidth;
	var imgHeight;

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

	var jitterStep = 15;
	var jitterFactor = 3;
	var jitterFlag = true;
	var jitterBorderFlag = true;
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
		cellColors = [];
		sites = [];
	}

	//Get Cell id in position
	p5.prototype.voronoiGetSite = function(x, y){

		var finalID;
		var min = Number.MAX_VALUE;
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {
			let site = voronoiDiagram.cells[i].site;
			let dist = dist2D(x,y,site.x,site.y);
			if(dist < min){
				min = dist;
				finalID = i;
			}
		}

		return finalID;

	}

	//Compute
	p5.prototype.voronoi = function(width, height){
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
		if(jitterFlag)
			jitter(jitterBorderFlag);

		//First instance
		if(!notFirst)
			notFirst = true;
	}

	//Simplify Gorhill structure to cells
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

			//Set Color
			cellColors.push([nX,nY,color(random(0,255),random(0,255),random(0,255))]);

			//Warn about maximum tries reached
			if (tries >= triesLimit)
				console.log("Warning: setRandoms tries limit reached: minimum distance(" + randomMinimumDist + ") not ensured");
		}
	}

	//Eucledian Distance
	function dist2D(ix, iy, fx, fy){
		return (sqrt(sq(ix - fx)+sq(iy - fy)))
	}

	//Get voronoi cell neighbors
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

	function removeDuplicates(arr){
	    let unique_array = []
	    for(let i = 0;i < arr.length; i++){
	        if(unique_array.indexOf(arr[i]) == -1){
	            unique_array.push(arr[i])
	        }
	    }
	    return unique_array;
	}

	//Draw a voronoi Cell
	p5.prototype.voronoiDrawCell = function(x, y, id, type, fill = true, jitter = false){

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

		if (type == VOR_CELLDRAW_BOUNDED) {
			drawCellBounded(x, y, id, siteX, siteY, jitter);			
		}else if(type == VOR_CELLDRAW_CENTER){
			drawCellCenter(x, y, id, siteX, siteY, jitter);
		}else if(type == VOR_CELLDRAW_SITE){
			drawCellSite(x, y, id, siteX, siteY, jitter);
		}

	}

	//Draw Cell Bounded
	function drawCellBounded(x, y, id, siteX, siteY, jitter){

		var target = cells;

		//Draw Jitter instead
		if(jitter){
			target = jitterCells;
		}

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

	//Draw Cell Centered
	function drawCellCenter(x, y, id, siteX, siteY, jitter){

		var target = cells;

		//Draw Jitter instead
		if(jitter){
			target = jitterCells;
		}

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
			vertex(target[id][i][0] - minX + x-dX/2, target[id][i][1] - minY + y-dY/2);
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

	//Draw Cell Site
	function drawCellSite(x, y, id, siteX, siteY, jitter){

		var target = cells;

		//Draw Jitter instead
		if(jitter){
			target = jitterCells;
		}

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
			vertex(target[id][i][0] - minX + x-(siteX-minX), target[id][i][1] - minY + y-(siteY-minY));
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

	//Draw Diagram
	p5.prototype.voronoiDraw = function(x, y, jitter = false){

		var target = cells;

		//Draw Jitter instead
		if(jitter){
			target = jitterCells;
		}

		push();

		//Render Cells
		for (var i = 0; i < target.length; i++) {

			strokeWeight(cellStrokeWeight);
			stroke(cellStroke);

			//Load Color
			setFillColorCell(i);

			//Shape
			beginShape();
			for (var j = 0; j < target[i].length; j++) {
				vertex(target[i][j][0], target[i][j][1]);
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

	//Draw Diagram Frame
	p5.prototype.voronoiDrawFrame = function(x, y, jitter = false){

		var target = cells;

		//Draw Jitter instead
		if(jitter){
			target = jitterCells;
		}

		push();

		//Render Cells
		for (var i = 0; i < target.length; i++) {

			strokeWeight(cellStrokeWeight);
			stroke(cellStroke);

			//Shape
			for (var j = 1; j < target[i].length; j++) {
				line(target[i][j][0] + x, target[i][j][1] + y, target[i][j-1][0] + x, target[i][j-1][1] + y);
			}

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

	//Set fill color from cell
	function setFillColorCell(cellId){
		for (var c = 0; c < cellColors.length; c++) {
			if(cellColors[c][0] == voronoiDiagram.cells[cellId].site.x && cellColors[c][1] == voronoiDiagram.cells[cellId].site.y){
				fill(cellColors[c][2]);
			}
		}
	}

	/*
	Set Jitter step
	*/
	p5.prototype.voronoiJitterStep = function(s){
		if(s >= 0)
			jitterStep = s;
	}

	/*
	Set Jitter factor
	*/
	p5.prototype.voronoiJitterFactor = function(f){
		jitterStep = f;
	}

	//Creates jittered version of cells
	function jitter(jitterEdges = true){
		jitterCells = [];
		var edgeMemory = [];
		//For each cell
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {
			var vertices = [];
			//For each edge
			for (var j = 0; j < voronoiDiagram.cells[i].halfedges.length; j++) {
				const edge = voronoiDiagram.cells[i].halfedges[j];
				//Detect diagram edge
				if(!jitterEdges){
					if((edge.getStartpoint().x == 0 && edge.getEndpoint().x == 0) ||
						(edge.getStartpoint().y == 0 && edge.getEndpoint().y == 0)||
						(edge.getStartpoint().x == imgWidth && edge.getEndpoint().x == imgWidth)||
						(edge.getStartpoint().y == imgHeight && edge.getEndpoint().y == imgHeight)){
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

		/*TEST DRAW
		for (var i = 0; i < jitterCells.length; i++) {
			beginShape();
			for (var j = 0; j < jitterCells[i].length; j++) {
				vertex(jitterCells[i][j][0]+100, jitterCells[i][j][1]+100);
			}
			endShape(CLOSE);
		}*/

	}

	//Jitter edge and add to vertices list
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
		var total = jitterStep;
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
			total += jitterStep;
		}

		//Add to edge memory
		memEdge.push([edge.getEndpoint().x, edge.getEndpoint().y]);
		edgeMemory.push([edge, memEdge]);

	}

})();