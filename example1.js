
function setup() {

	createCanvas(windowWidth, windowHeight);
  	background(50);

	voronoiRndSites(30, 50);

	voronoiSites([[5,5],[10,10],[15,15],[20,20]]);

	voronoiRemoveSite(5, 5);

	for (var i = 0; i < 20; i++) {
		voronoiSite(i*10, 20);
	}

	//voronoiClearSites();

	voronoi(700,500);

	voronoiDraw(0, 0);

	console.log(voronoiGetSite(20,20));

	voronoiDrawCell(800,10,30,VOR_CELLDRAW_BOUNDED);

	voronoiDrawCell(800,300,30,VOR_CELLDRAW_SITE);

	voronoiDrawCell(800,500,30,VOR_CELLDRAW_CENTER);

	//Vertical Line
	line(800,10,800,800);
	//Horizontal Line 1
	line(800,10,1000,10);
	//Horizontal Line 2
	line(800,300,1000,300);
	//Horizontal Line 3
	line(800,500,1000,500);

}
