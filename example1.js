
function setup() {

	createCanvas(windowWidth, windowHeight);
  	background(50);

	voronoiRndSites(30, 50);

	voronoiSites([[5,5],[10,10],[15,15],[20,20]]);

	voronoiRemoveSite(5, 5);

	//voronoiClear();

	for (var i = 0; i < 20; i++) {
		voronoiSite(i*10, 20);
	}

	voronoi(700,500);

	voronoiDraw(0, 0);

	console.log(voronoiGetSite(20,20));

}
