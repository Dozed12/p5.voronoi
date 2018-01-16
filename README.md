# p5.voronoi

A work-in-progress voronoi library for p5.js using the javascript implementation by [gorhill](https://github.com/gorhill/Javascript-Voronoi).

![alt text](https://github.com/Dozed12/p5.voronoi/blob/master/screenshot.png)

## Instalation 

Link rhill-voronoi-core.js and p5.voronoi.js to your HTML file. Make sure you link rhill-voronoi-core.js first.

## Features

This library allows you to compute and draw Voronoi diagrams for p5.js.
It currently has the following features:

- Add/Remove custom sites with custom colors
- Add random sites with minimum distance
- Draw the full voronoi diagram
- Get cell associated with diagram coordinates
- Get neighboring cells
- Draw individual cells with different centers

You can visit [https://dozed12.github.io/p5.voronoi/](https://dozed12.github.io/p5.voronoi/) for a live example of these features with a detailed explaination in the [example1.js](https://github.com/Dozed12/p5.voronoi/blob/master/example1.js) file.

### Note

Although my goal is to make using voronoi diagrams as accessible as possible and follow p5.js goal, there is always space for different usage that I won't foresee, therefore you can still access the voronoiDiagram variable which is the result of computing the diagram with [gorhill](https://github.com/gorhill/Javascript-Voronoi) implementation. For this effect I recommend you check his source code for details on how to use his implementation. Take the opportunity to show some love for his work :)

Additionally, feel free to create issues for new feature requests or bugs that you may find.
