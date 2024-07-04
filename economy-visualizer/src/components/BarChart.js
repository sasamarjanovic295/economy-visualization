import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { fixInUnit, getMeasurementUnit, createArray, getDivider } from '../services/NumberService';

const BarChart = ({ data, countries, parameter, yearsRange }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            createBarChart(containerRef.current, data, countries, parameter, yearsRange);
        }
    }, [data, countries, parameter, yearsRange]);

    return <div className="bar-chart-container" ref={containerRef}></div>;
};

function createBarChart(container, data, countries, parameter, yearsRange) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const years = createArray(yearsRange[0], yearsRange[1]);

    const minValue = d3.min(countries, country =>
        d3.min(years, year => +data[country][year][parameter] || Infinity)
    );

    const maxValue = d3.max(countries, country =>
        d3.max(years, year => +data[country][year][parameter] || 0)
    );

    const range = maxValue - minValue;
    const extendedMinValue = minValue < 0 ? minValue : 0;
    const extendedMaxValue = maxValue + 0.1 * range;

    const unit = getMeasurementUnit(maxValue, true);

    const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([extendedMinValue, extendedMaxValue])
        .range([height, 0]);

    const divider = getDivider(yearsRange[0], yearsRange[1]);

    const tickValues = years.filter((year, index) => index % divider === 0);

    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .tickValues(tickValues);

    const yAxis = d3.axisLeft(y)
        .tickFormat(d => fixInUnit(d, unit, 1));

    let svg = d3.select(container).select("svg");

    if (svg.empty()) {
        const svg = d3.select(container).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width / 2)
            .attr("y", 40)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "grey")
            .text("Year");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", - height / 2)
            .attr("y", -50)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "grey")
            .text(parameter + " (" + unit + ")");
    
    
    } else {
        svg.select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        svg.select(".y.axis")
            .transition()
            .duration(1000)
            .call(yAxis);
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const allBars = svg.selectAll(".bar")
    .data(countries.flatMap(country => years.map(year => ({
        country,
        year,
        value: +data[country][year][parameter] || 0
    }))), d => d.country + d.year);

    countries.forEach(function (country, index) {
        const countryData = years.map(function (year) {
            return {
                year: year,
                value: +data[country][year][parameter] || 0
            };
        });

        const bars = svg.selectAll(`.bar ${country}`)
            .data(countryData, d => d.year);

        bars.enter().append("rect")
            .attr("class", `bar ${country}`)
            .attr("x", d => x(d.year) + index * (x.bandwidth() / countries.length))
            .attr("width", x.bandwidth() / countries.length)
            .attr("y", y(0))
            .attr("height", 0)
            .style("fill", color(index))
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", d => x(d.year) + index * (x.bandwidth() / countries.length))
            .attr("width", x.bandwidth() / countries.length)
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value));

        bars.exit().transition()
            .duration(1000)
            .attr("y", y(0))
            .attr("height", 0)
            .remove();
    });

    allBars.exit().transition()
        .duration(1000)
        .attr("y", y(0))
        .attr("height", 0)
        .remove();

    var legend = svg.selectAll(".legend")
        .data(countries);

    var legendEnter = legend.enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(" + margin.left + "," + `${i * 20 + margin.top})`);

    legendEnter.append("rect")
        .attr("x", 9)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => color(i));

    legendEnter.append("text")
        .attr("x", 30)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("fill", "grey")
        .text(d => d);

    var legendUpdate = legendEnter.merge(legend)
        .attr("transform", (d, i) => "translate(" + margin.left + "," + `${i * 20 + margin.top})`);

    legendUpdate.select("rect")
        .style("fill", (d, i) => color(i));

    legendUpdate.select("text")
        .text(d => d);

    legend.exit().remove();
}

export default BarChart;
