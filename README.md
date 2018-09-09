# p5.voronoi

A voronoi library for p5.js using Fortune's algorithm implementation by [gorhill](https://github.com/gorhill/Javascript-Voronoi).

![alt text](https://github.com/Dozed12/p5.voronoi/blob/master/screenshot.png)

## Instalation 

Link rhill-voronoi-core.js and p5.voronoi.js, or p5.voronoi.min.js for the minified version, to your HTML file. Make sure you link rhill-voronoi-core.js first. Check [index.html](https://github.com/Dozed12/p5.voronoi/blob/master/index.html) for an example.

## Features

This library allows you to compute and draw Voronoi diagrams in p5.js.
It currently has the following features:

- Add/Remove custom sites with custom colors
- Add random sites with minimum distance (just for testing, you should make your own)
- Draw the full voronoi diagram
- Get cell associated with diagram coordinates
- Get neighboring cells
- Draw individual cells with different centers(Bounding Box, Centered on Site or Geometric Center)
- Apply a jitter effect to the diagram

You can visit [https://dozed12.github.io/p5.voronoi/](https://dozed12.github.io/p5.voronoi/) for a live example of these features with a detailed explanation in the [example1.js](https://github.com/Dozed12/p5.voronoi/blob/master/example1.js) file.

### Note

Although my goal is to make using voronoi diagrams as accessible as possible and follow p5.js goal, there is always room for different uses that I won't foresee, therefore you can still access the voronoiDiagram variable which is the result of computing the diagram with [gorhill](https://github.com/gorhill/Javascript-Voronoi) implementation. For this effect I recommend you check his source code for details on how to use his implementation. Take the opportunity to show some love for his work :)

Additionally, feel free to create issues for new feature requests or bugs that you may find.
