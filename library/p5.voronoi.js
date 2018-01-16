
/*

Gorhill implementation

https://github.com/gorhill/Javascript-Voronoi

*/

var voronoiDiagram;

const VOR_CELLDRAW_BOUNDED = 1;
const VOR_CELLDRAW_CENTER = 2;
const VOR_CELLDRAW_SITE = 3;

var VOR_CELLSTROKE_WEIGHT = 1;
var VOR_CELLSTROKE = 0;
var VOR_SITESTROKE_WEIGHT = 3;
var VOR_SITESTROKE = 0;

(function() {

	var graphics;

	var imgWidth;
	var imgHeight;

	var sites = [];

	var notFirst = false;
	var nRandoms;
	var randomMinimumDist = 0;

	var voronoiObj = new Voronoi();

	var cellColors = [];

	/*
	Stroke Setting Functions
	*/
	p5.prototype.voronoiCellStrokeWeight = function(v){
		if(v > 0)
			VOR_CELLSTROKE_WEIGHT = v;	
	}
	p5.prototype.voronoiCellStroke = function(v){
		if(v > 0)
			VOR_CELLSTROKE = v;	
	}
	p5.prototype.voronoiSiteStrokeWeight = function(v){
		if(v > 0)
			VOR_SITESTROKE_WEIGHT = v;	
	}
	p5.prototype.voronoiSiteStroke = function(v){
		if(v > 0)
			VOR_SITESTROKE = v;	
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

	//Draw Diagram
	p5.prototype.voronoiDraw = function(x, y){

		//Reset Graphics
		graphics.resizeCanvas(imgWidth,imgHeight,true);

		//Render Cells
		for (var i = 0; i < voronoiDiagram.cells.length; i++) {

			graphics.strokeWeight(VOR_CELLSTROKE_WEIGHT);
			graphics.stroke(VOR_CELLSTROKE);

			//Load Color
			setFillColorCell(i);

			//Shape
			graphics.beginShape();
			for (var j = 0; j < voronoiDiagram.cells[i].halfedges.length; j++) {
				var halfEdge = voronoiDiagram.cells[i].halfedges[j];
				vertex(x + halfEdge.getStartpoint().x,y + halfEdge.getStartpoint().y);
			}
			graphics.endShape(CLOSE);

			//Render Site
			graphics.strokeWeight(VOR_SITESTROKE_WEIGHT);
			graphics.stroke(VOR_SITESTROKE);
			let sX = x + voronoiDiagram.cells[i].site.x;
			let sY = y + voronoiDiagram.cells[i].site.y;
			graphics.point(sX,sY);
		}

		//Draw to screen
		image(graphics,x,y);

	}

	//Compute
	p5.prototype.voronoi = function(width, height){
		//Create Buffer
		if(!notFirst){
			graphics = createGraphics(width, height);
			graphics.noSmooth();
		}
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
		//First instance;
		notFirst = true;
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
	p5.prototype.voronoiDrawCell = function(x, y, id, type, fill = true){

		//Reset Graphics
		graphics.resizeCanvas(imgWidth,imgHeight,true);
		graphics.noSmooth();

		if(id >= voronoiDiagram.cells.length || id === undefined)
			return;

		var halfedges = voronoiDiagram.cells[id].halfedges;
		var siteX = voronoiDiagram.cells[id].site.x;
		var siteY = voronoiDiagram.cells[id].site.y;

		//Load Color
		setFillColorCell(id);

		if (type == VOR_CELLDRAW_BOUNDED) {
			drawCellBounded(x, y, halfedges, siteX, siteY, fill);
		}else if(type == VOR_CELLDRAW_CENTER){
			drawCellCenter(x, y, halfedges, siteX, siteY, fill);
		}else if(type == VOR_CELLDRAW_SITE){
			drawCellSite(x, y, halfedges, siteX, siteY, fill);
		}

	}

	//Draw Cell Bounded
	function drawCellBounded(x, y, halfedges, siteX, siteY, fill){

		graphics.strokeWeight(VOR_CELLSTROKE_WEIGHT);

		//Find minimums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		for (var i = 0; i < halfedges.length; i++) {
			if (halfedges[i].getStartpoint().x < minX)
				minX = halfedges[i].getStartpoint().x;
			if (halfedges[i].getStartpoint().y < minY)
				minY = halfedges[i].getStartpoint().y;
		}

		//Check fill flag
		if(!fill)
			graphics.noFill();

		//Draw
		graphics.beginShape();
		for (var i = 0; i < halfedges.length; i++) {
			vertex(halfedges[i].getStartpoint().x - minX, halfedges[i].getStartpoint().y - minY);
		}
		graphics.endShape(CLOSE);

		//Draw Site
		graphics.strokeWeight(VOR_SITESTROKE_WEIGHT);
		graphics.stroke(VOR_SITESTROKE);
		graphics.point(siteX - minX, siteY - minY);

		//Draw to screen
		image(graphics,x,y);

	}

	//Draw Cell Centered
	function drawCellCenter(x, y, halfedges, siteX, siteY, fill){

		//Stroke Settings
		graphics.strokeWeight(VOR_CELLSTROKE_WEIGHT);
		graphics.stroke(VOR_CELLSTROKE);

		//Find minimums and maximums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		let maxX = 0;
		let maxY = 0;
		for (var i = 0; i < halfedges.length; i++) {
			if (halfedges[i].getStartpoint().x < minX)
				minX = halfedges[i].getStartpoint().x;
			if (halfedges[i].getStartpoint().y < minY)
				minY = halfedges[i].getStartpoint().y;
			if (halfedges[i].getStartpoint().x > maxX)
				maxX = halfedges[i].getStartpoint().x;
			if (halfedges[i].getStartpoint().y > maxY)
				maxY = halfedges[i].getStartpoint().y;
		}

		let dX = maxX - minX;
		let dY = maxY - minY;

		//Check fill flag
		if(!fill)
			graphics.noFill();

		//Draw
		graphics.beginShape();
		for (var i = 0; i < halfedges.length; i++) {
			vertex(halfedges[i].getStartpoint().x - minX, halfedges[i].getStartpoint().y - minY);
		}
		graphics.endShape(CLOSE);

		//Draw Site
		graphics.strokeWeight(VOR_SITESTROKE_WEIGHT);
		graphics.stroke(VOR_SITESTROKE);
		graphics.point(siteX - minX, siteY - minY);

		//Draw to screen
		image(graphics,x-dX/2,y-dY/2);

	}

	//Draw Cell Site
	function drawCellSite(x, y, halfedges, siteX, siteY, fill){

		//Stroke Settings
		graphics.strokeWeight(VOR_CELLSTROKE_WEIGHT);
		graphics.stroke(VOR_CELLSTROKE);

		//Find minimums and maximums
		let minX = Number.MAX_VALUE;
		let minY = Number.MAX_VALUE;
		for (var i = 0; i < halfedges.length; i++) {
			if (halfedges[i].getStartpoint().x < minX)
				minX = halfedges[i].getStartpoint().x;
			if (halfedges[i].getStartpoint().y < minY)
				minY = halfedges[i].getStartpoint().y;
		}

		//Check fill flag
		if(!fill)
			graphics.noFill();

		//Draw
		graphics.beginShape();
		for (var i = 0; i < halfedges.length; i++) {
			vertex(halfedges[i].getStartpoint().x - minX, halfedges[i].getStartpoint().y - minY);
		}
		graphics.endShape(CLOSE);

		//Draw Site
		graphics.strokeWeight(VOR_SITESTROKE_WEIGHT);
		graphics.stroke(VOR_SITESTROKE);
		graphics.point(siteX - minX, siteY - minY);

		//Draw to screen
		image(graphics,x-(siteX-minX),y-(siteY-minY));

	}

	//Draw Diagram Frame
	p5.prototype.voronoiDrawFrame = function(x, y){

		//Reset Graphics
		graphics.resizeCanvas(imgWidth,imgHeight,true);
		graphics.noSmooth();

		//Stroke Settings
		graphics.strokeWeight(VOR_CELLSTROKE_WEIGHT);
		graphics.stroke(VOR_CELLSTROKE);

		//Render Frame
		var edges = voronoiDiagram.edges;
		for (var i = 0; i < edges.length; i++) {
			graphics.line(edges[i].va.x, edges[i].va.y, edges[i].vb.x, edges[i].vb.y);
		}

		//Draw to screen
		image(graphics,x,y);
	}

	//Set fill color from cell
	function setFillColorCell(cellId){
		for (var c = 0; c < cellColors.length; c++) {
			if(cellColors[c][0] == voronoiDiagram.cells[cellId].site.x && cellColors[c][1] == voronoiDiagram.cells[cellId].site.y){
				graphics.fill(cellColors[c][2]);
				return;
			}
		}
	}

})();