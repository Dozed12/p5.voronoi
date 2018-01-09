
function setup() {

	createCanvas(windowWidth, windowHeight);
  	background(50);

	voronoiRndSites(30, 50);

	voronoiSites([[5,5],[10,10],[15,15],[20,20]]);

	voronoiRemoveSite(5, 5);

	for (var i = 0; i < 20; i++) {
		voronoiSite(i*10, 20);
	}

	voronoiSite(200,200,color(255,255,255));

	//voronoiClearSites();	

	voronoi(700,500);

}

function draw(){

	background(100);	

	voronoiDraw(0, 0);

	var cell = voronoiGetSite(mouseX,mouseY);

	console.log(voronoiNeighbors(cell));

	voronoiDrawCell(800,10,cell,VOR_CELLDRAW_BOUNDED);

	voronoiDrawCell(800,300,cell,VOR_CELLDRAW_SITE);

	voronoiDrawCell(800,500,cell,VOR_CELLDRAW_CENTER);

	//Vertical Line
	line(800,10,800,800);
	//Horizontal Line 1
	line(800,10,1000,10);
	//Horizontal Line 2
	line(800,300,1000,300);
	//Horizontal Line 3
	line(800,500,1000,500);
}