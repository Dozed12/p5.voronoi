
function setup() {

	createCanvas(1200, 1000);

	noSmooth();

	//Add 30 random sites with 50 minimum distance to be
	//added upon computing
	voronoiRndSites(30, 50);

	//Add array of custom sites
	voronoiSites([[5,5],[10,10],[15,15]]);

	//Remove custom site with coordinates 5,5
	voronoiRemoveSite(5, 5);

	for (var i = 0; i < 20; i++) {
		//Add custom site with coordinates i*10,20
		voronoiSite(i*10, 20);
	}

	//Add custom site with custom color
	voronoiSite(200,200,color(255,255,255));

	//Clear custom sites (does not clear random sites)
	//voronoiClearSites();	

	//Compute voronoi diagram with size 700 by 500
	voronoi(700,500);

	mousePressed();

}

function mousePressed(){
	background(150);	

	//Draw diagram in coordinates 0, 0
	voronoiDraw(0, 0);

	//Example rect to demonstrate frame transparency
	rect(100,600,200,200);

	//Draw diagram frame in coordinates 0, 500
	voronoiDrawFrame(0, 500);

	//Get id of voronoi cell that contains the
	//coordinates mouseX, mouseY
	//Note that these coordinates are relative to
	//the voronoi diagram and not any drawn diagram.
	//In this example we can use mouseX and mouseY
	//directly since we drawn our diagram at
	//coordinates 0,0
	var cellId = voronoiGetSite(mouseX,mouseY);

	//Get ids of voronoi cells neighboring cellId
	console.log(cellId + ": " + voronoiNeighbors(cellId));

	//Draw a specific voronoi cell using different centers

	//Draw cell from top left
	voronoiDrawCell(800,10,cellId,VOR_CELLDRAW_BOUNDED);
	//Draw cell frame from top left
	voronoiDrawCell(1000,10,cellId,VOR_CELLDRAW_BOUNDED, false);

	//Draw cell from site
	voronoiDrawCell(800,300,cellId,VOR_CELLDRAW_SITE);
	//Draw cell frame from site
	voronoiDrawCell(1000,300,cellId,VOR_CELLDRAW_SITE, false);

	//Draw cell from geometric center
	voronoiDrawCell(800,610,cellId,VOR_CELLDRAW_CENTER);
	//Draw cell frame from geometric center
	voronoiDrawCell(1000,610,cellId,VOR_CELLDRAW_CENTER, false);	

	//Guide lines to compare different draw modes

	//Vertical Line 1
	line(800,10,800,800);
	//Vertical Line 2
	line(1000,10,1000,800);
	//Horizontal Line 1
	line(800,10,1200,10);
	//Horizontal Line 2
	line(800,300,1200,300);
	//Horizontal Line 3
	line(800,610,1200,610);
}