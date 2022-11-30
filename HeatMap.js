function HeatMap() {
   // variables for svg (canvas)
   let width = 1200;
   let height = 600;
   let padding = 60;
   let svg = d3.select('body').append('svg');    // appends svg element to body
   // variables for tooltip
   let tooltip = d3.select('body').append('div')  // appends tootip element to body
   // variables for chart
   let legend = d3.select('svg').append('svg').attr('id', 'legend')  // appends svg#legend element to svg canvas
   // variables for chart
   let xScale;
   let yScale;
   let xAxis;
   let yAxis;
   let minXAxis;
   let maxXAxis;
   let minYAxis;
   let maxYAxis;
   // variables for chart legend
   let keys = []
   // variables for JSON data
   let dataJSON;
   let dataset = [];
   let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
   let req = new XMLHttpRequest();

   // draw canvas for chart (the svg element)
   let drawCanvas = () => {
      svg.attr('id', 'canvas')
         .attr('width', width)
         .attr('height', height);
   }

   let generateMapTitle = (titleLocationX, titleLocationY) => {
      svg.append('text')
         .text('Monthly Global Land-Surface Temperature')
         .attr('id', 'title')
         .attr('x', titleLocationX)
         .attr('y', titleLocationY);
   }

   let generateMapDescribtion = (LocationX, LocationY) => {
      svg.append('text')
         .text('1753 - 2015: base temperature 8.66℃')
         .attr('id', 'description')
         .attr('x', LocationX)
         .attr('y', LocationY);
   }

   // GENERATE SCALES
   // Convert month index number to date (in date format)
   let mthIndexToDate = (mthIndex) => {
      return new Date(0, mthIndex, 0, 0, 0, 0, 0);         // returns date (yr,mth,day,hr,min,sec,m.sec) (mth from 0 to 11) 
   }

   let colorScale1 = d3.scaleOrdinal()
      .domain([d3.min(dataset, (item) => item["variance"]), d3.max(dataset, (item) => item["variance"])])
      .range(['purple', 'blue', 'green', 'orange', 'red', 'brown']);

   let colorScale2 = (temp) => {
      if(temp <= -1.5) {
         return 'rgb(30, 136, 229)'
      } else if (temp <= -0.5) {
         return 'rgb(179, 229, 252)'
      } else if(temp <= 0.5) {
         return 'rgb(255, 236, 179)'
      } else if(temp <= 1.5) {
         return 'rgb(255, 204, 128)'
      } else {
         return 'rgb(230, 74, 25)'
      }
   }

   let generateScales = () => {
      minXAxis = d3.min(dataset, (item) => item['year']);
      maxXAxis = d3.max(dataset, (item) => item['year']);
      minYAxis = mthIndexToDate(0);
      maxYAxis = mthIndexToDate(12);

      xScale = d3.scaleLinear()
                  .domain([minXAxis, maxXAxis + 1])
                  .range([padding, width - padding]);
      yScale = d3.scaleTime()
                  .domain([minYAxis, maxYAxis])
                  .range([padding, height - padding]);
   }

   let generateAxes = () => {
      xAxis = d3.axisBottom(xScale)
                     .tickFormat(d3.format('d'));             // D3 number format to render axis numbers in decimal/integer (removes commas)
      yAxis = d3.axisLeft(yScale)
                     .tickFormat(d3.timeFormat('%B'));      // '%b' = d3 time format - full month name
                     //.tickFormat((month) => d3.timeFormat("%b")(mthIndexToDate(month)))

      svg.append('g')                                       // create group element to contain axis
         .call(xAxis)
         .attr('id', 'x-axis')
         .attr('transform', 'translate(0, ' + (height - padding) + ')');
      svg.append('g')
         .call(yAxis)
         .attr('id', 'y-axis')
         .attr('transform', 'translate(' + padding + ', 0)');
   }

   let generateAxesCaption = () => {
      svg.append('text')
         .attr('transform', 'rotate(-90)')
         .attr('x', -height / 3)
         .attr('y', 10)
         .text('Months');
      svg.append('text')
         .attr('x', 450)
         .attr('y', 590)
         .text('Years')
         .attr('class', 'info');
   }

   // GENERATE LEGEND (info: https://d3-graph-gallery.com/graph/custom_legend.html)
      // keys for legend & color scale
   keys = [-1.5, -0.5, 0.5, 1.5, 1.51]
   let generateLegend = () => {
      // // Add one bar in the legend for each legend item.
      let size = padding /3
      legend.selectAll('mybars')
         .data(keys)
         .enter()
         .append('rect')
         //.attr('id', 'legend')
            // .attr('class', 'legend')
            .attr('class', 'legend')
            .attr('x', (d, i) => 600 + i*(size + 5)) // 100 is where the first dot appears. 25 is the distance between dots
            .attr('y', height - padding/3) 
            .attr('width', size)
            .attr('height', size)
            .attr("fill", (d) => colorScale2(d));
      // Add one label in the legend for each item.
      legend.selectAll("mylabels")
         .data(keys)
         .enter()
         .append("text")
            .attr("x", (d, i) => 600 + i*(size + 5))
            .attr("y", height - padding / 2)
            .text((d) => {
               if(d === -1.5) {
                  return '<1.5'
               } else if (d === 1.51) {
                  return '>1.5'
               } else {
                  return d
               }
            })
            .attr("text-anchor", "right")
            .style("alignment-baseline", "middle")
            .style('font-size', '12px');
   }

   let drawCells = () => {
      svg.selectAll('rect')
         .data(dataset)
         .enter()
         .append('rect')
         .attr('class', 'cell')
         .attr('data-year', (item) => item['year'])
         .attr('data-month', (item) => item['month'] - 1)
         .attr('data-temp', (item) => item['variance'])
         .attr('x', (item, index) => xScale(item["year"]))
         //.attr('y', (item) => yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0)))
         .attr('y', (item) => yScale(mthIndexToDate(item["month"] - 1)))
         .attr('height', (height - (2 * padding)) / 12)         
         .attr('width', (width - (2 * padding)) / (maxXAxis - minXAxis))
         //.attr('fill', (item) => colorScale1(item['variance']))
         .attr('fill', (item) => colorScale2(item['variance']))
         .on('mouseover', mouseover)
         .on('mousemove', mousemove)
         .on('mouseleave', mouseleave);
   }

   // GENERATE TOOLTIP (info @: https://d3-graph-gallery.com/graph/interactivity_tooltip.html)
   let generateTooltip = () => {
      tooltip
         .attr('class', 'tooltip')
         .attr('id', 'tooltip')
         .style('opacity', 0)
         .style('width', 'auto')
         .style('height', 'auto');
   }
   let mouseover = (event, item) => {
      tooltip
         .style('opacity', 0.9)
         .attr('data-year', item['year']);
   }
   let mousemove = (event, item) => {
      tooltip
         .html('Year/Month: ' +  item['year'] + '/' + item['month'] + '<br/>' + 'Temperature: ' + (item['variance'] + 8.66) + '<br/>' + 'Variance: ' + item['variance'])
         // .style("left", (d3.mouse(this)[0] + 50) + "px") // PROBLEM WITH CODE
         // .style("top", (d3.mouse(this)[1]) + "px")       // PROBLEM WITH CODE
         .style('left', event.pageX + 20 + 'px')
         .style('top', event.pageY - 20 + 'px');
   }
   let mouseleave = () => {
      tooltip
         .style('opacity', 0);
   }

   req.open('GET', url, true);                     // initialize request for data
   req.send();                                     // send request for data
   req.onload = function() {
      dataJSON = JSON.parse(req.responseText);     // parse returned data
      dataset = dataJSON.monthlyVariance;          // select relevant JSON data part & assign to a variable
      // console.log(dataset)
      drawCanvas();
      generateMapTitle('200', '30');
      generateMapDescribtion('200', '50')
      generateScales();
      generateAxes();
      drawCells();
      generateAxesCaption();
      generateLegend()
      generateTooltip()
   };

   return (
      <div>
         <button>Get Data</button>
         <button>Generate Map</button>
      </div>
   )

}