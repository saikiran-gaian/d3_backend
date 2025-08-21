// server.js
import express from "express";

const app = express();
app.use(express.json());

// Example endpoint
app.post("/render", (req, res) => {
  const { type, data } = req.body;

  let chartScript = "";

  if (type === "bar-chart") {
    chartScript = `
    <script>
      const config = {
        id: 'bar-chart',
        title: 'Bar Chart',
        data: {
          source: { type: 'inline', data: ${JSON.stringify(data)} },
          fields: [
            { name: 'category', type: 'nominal', accessor: 'category' },
            { name: 'value', type: 'quantitative', accessor: 'value' }
          ]
        },
        space: { width: 800, height: 400 },
        scales: {
          x: { type: 'band', range: [50, 750], params: { padding: 0.1 } },
          y: { type: 'linear', range: [350, 50] },
          color: { type: 'ordinal', scheme: d3.schemeCategory10 }
        }
      };

      const data = config.data.source.data;
      const width = config.space.width;
      const height = config.space.height;

      const svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height);

      const x = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range(config.scales.x.range)
        .padding(config.scales.x.params.padding);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range(config.scales.y.range)
        .nice();

      const color = d3.scaleOrdinal(config.scales.color.scheme)
        .domain(data.map(d => d.category));

      svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => y.range()[0] - y(d.value))
        .attr("fill", d => color(d.category));

      svg.append("g")
        .attr("transform", \`translate(0,\${height - 50})\`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(y));
    </script>
    `;
  }

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>D3 Chart Renderer</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
      body { font-family: system-ui, sans-serif; }
      svg { background: #fafafa; }
      .bar:hover { opacity: 0.8; }
      .axis path, .axis line { stroke: #aaa; }
    </style>
  </head>
  <body>
    <svg id="chart" width="800" height="400"></svg>
    ${chartScript}
  </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.listen(3000, () => {
  console.log("Chart renderer service running at http://localhost:3000");
});
