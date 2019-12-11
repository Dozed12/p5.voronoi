
function setup() {

	createCanvas(1200, 1100);
	noSmooth();

	//Settings for drawing(these are the default values)

	//Set Cell Stroke Weight
	voronoiCellStrokeWeight(1);
	//Set Site Stroke Weight
	voronoiSiteStrokeWeight(3);
	//Set Cell Stroke
	voronoiCellStroke(0);
	//Set Site Stroke
	voronoiSiteStroke(0);
	//Set flag to draw Site
	voronoiSiteFlag(true);

	//Sets 30 random sites with 50 minimum distance to be added upon computing
	//Please note that this method is just for testing, you should use your own
	//method for placing random sites with minimum distance
	voronoiRndSites(30, 50);

	//Add array of custom sites
	voronoiSites([[5,5],[10,5],[15,5]]);

	//Add array of custom sites with custom colors associated (255 = white)
	voronoiSites([[5,20,255],[10,20,255],[15,20,255]]);

	//Remove custom site with coordinates 15,5
	voronoiRemoveSite(15, 5);

	//Remove custom site with index 0 (in this case it's the site with coordinates [5,5])
	voronoiRemoveSite(0);

	//Add custom site with coordinates i*30,50
	for (var i = 0; i < 10; i++) {
		voronoiSite(i * 30, 50);
	}

	//Add custom site with custom color at coordinates 50,100 (255 = white)
	voronoiSite(50, 100, 255);

	//Clear custom sites (does not clear random sites)
	//voronoiClearSites();

	//Jitter Settings (These are the default settings)

	//Maximum distance between jitters
	voronoiJitterStepMax(20);
	//Minimum distance between jitters
	voronoiJitterStepMin(5);
	//Scales each jitter
	voronoiJitterFactor(3);
	//Jitter edges of diagram
	voronoiJitterBorder(false);

	//Compute voronoi diagram with size 700 by 500
	//With a prepared jitter structure (true)
	voronoi(700, 500, true);

	//Get the raw diagram, for more advanced use
	//This is purely to get information, doesn't change the diagram
	//https://github.com/gorhill/Javascript-Voronoi
	var diagram = voronoiGetDiagram();
	console.log(diagram);

	//Get simplified cells without jitter, for more advanced use
	var normal = voronoiGetCells();
	console.log(normal);

	//Get simplified cells with jitter, for more advanced use
	var jitter = voronoiGetCellsJitter();
	console.log(jitter);

	//Simulate initial mouse press for simplicity
	mousePressed();

}

function mousePressed(){
	background(150);	

	//Draw diagram in coordinates 0, 0
	//Filled and without jitter
	voronoiDraw(0, 0, true, false);

	//Draw diagram frame in coordinates 0, 500
	//Not filled and with jitter
	voronoiDraw(0, 520, false, true);

	//Get id of voronoi cell that contains the coordinates mouseX, mouseY without accounting for jitter(false)
	//Note that these coordinates are relative to the voronoi diagram and not any drawn diagram.
	//In this example we can use mouseX and mouseY directly since we drawn our diagram at
	//coordinates 0,0
	var cellId = voronoiGetSite(mouseX, mouseY, false);

	if(cellId !== undefined){

		//Get ids of voronoi cells neighboring cellId
		//Ctrl+Shift+I on Chrome to open the console
		console.log(cellId + ": " + voronoiNeighbors(cellId));

		//Get color of selected voronoi cell
		console.log("Color: " + voronoiGetColor(cellId));

	}

	//Draw a specific voronoi cell using different centers

	//Draw cell from top left without jitter
	voronoiDrawCell(800, 10, cellId,VOR_CELLDRAW_BOUNDED, true, false);
	//Draw cell frame from top left with jitter
	voronoiDrawCell(1000, 10, cellId,VOR_CELLDRAW_BOUNDED, false, true);

	//Draw cell from site without jitter
	voronoiDrawCell(800, 300, cellId,VOR_CELLDRAW_SITE, true, false);
	//Draw cell frame from site with jitter
	voronoiDrawCell(1000, 300, cellId,VOR_CELLDRAW_SITE, false, true);

	//Draw cell from geometric center without jitter
	voronoiDrawCell(800, 610, cellId,VOR_CELLDRAW_CENTER, true, false);
	//Draw cell frame from geometric center with jitter
	voronoiDrawCell(1000, 610, cellId,VOR_CELLDRAW_CENTER, false, true);	

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