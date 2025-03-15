// Question 2.1:


// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 30, right: 30, bottom: 40, left: 50 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) 
        .range([0, width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Likes");

    // calculating quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };


// Group the data by Platform and calculate quartiles for each platform.
// Instead of "species" in the given template, I used "Platform" because our dataset deals with social media platforms
// d3.rollup() takes the data and groups it based on the Platform column (like facebook, twitter, etc.)
// For each platform it applies rollupFunction which calculates min, Q1, median, Q3, max vals.
// result is a Map where the key is the platform name, and the value is an object with quartile values.
const quantilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

//Go through each platform in quantilesByPlatform to draw the box plot
quantilesByPlatform.forEach((quantiles, platform) => {
    // Find the X position for this platform’s box
    // xScale(platform) gives the starting position, and adding half the width centers the box.
    const x = xScale(platform) + xScale.bandwidth() / 2; 

    // The width of each box
    // xScale.bandwidth() gives the space assigned to each platform on the x axis
    const boxWidth = xScale.bandwidth(); 

    svg.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", yScale(quantiles.min)) 
        .attr("y2", yScale(quantiles.max))
        .attr("stroke", "black");

    svg.append("rect")
        .attr("x", xScale(platform))
        .attr("y", yScale(quantiles.q3)) 
        .attr("width", boxWidth)
        .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3)) 
        .attr("stroke", "black")
        .attr("fill", "lightgray"); 

    svg.append("line")
        .attr("x1", xScale(platform)) 
        .attr("x2", xScale(platform) + boxWidth)
        .attr("y1", yScale(quantiles.median)) 
        .attr("y2", yScale(quantiles.median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    });
});








// Question 2.2:


// Load the cleaned data (SocialMediaAvg.csv)
const socialMediaAvg = d3.csv("SocialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert AvgLikes to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define dimensions and margins
    const margin = { top: 40, right: 120, bottom: 50, left: 70 }, 
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) 
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))]) 
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // Group data by platform
    const barGroups = svg.selectAll(".barGroup")
        .data(d3.groups(data, d => d.Platform)) 
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d[0])}, 0)`);

    // Add bars for each PostType
    barGroups.selectAll("rect")
        .data(d => d[1]) 
        .enter()
        .append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 30}, ${margin.top})`); // Changed to + 30 from - 150 as the legend ovelaps with the bars.

    const postTypes = [...new Set(data.map(d => d.PostType))];

    // Add legend squares and text
    postTypes.forEach((type, i) => {
        // Color
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        // Text nexrt to color box
        legend.append("text")
            .attr("x", 25) 
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle")
            .attr("fill", "black")
            .style("font-size", "14px");
    });
});







// Question 2.3:


// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert AvgLikes to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes; 
    });

    // Dimensions and margins
    const margin = { top: 40, right: 50, bottom: 70, left: 70 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Date)) 
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.AvgLikes) - 10, d3.max(data, d => d.AvgLikes) + 10])
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")  
        .style("text-anchor", "end")  
        .attr("transform", "rotate(-25)");

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // create line generator with curveNatural
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2)  
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural); 

    // drawing the line path
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue") 
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add circles for each data point
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Date) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.AvgLikes))
        .attr("r", 5)
        .attr("fill", "orange") 
        .attr("stroke", "black");
});
