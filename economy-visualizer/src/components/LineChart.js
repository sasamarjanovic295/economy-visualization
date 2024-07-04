import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { createArray, fixInUnit, getMeasurementUnit, unit as u } from '../services/NumberService';

const LineChart = ({ data, countries, parameter, yearsRange }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            createLineChart(containerRef.current, data, countries, parameter, yearsRange);
        }
    }, [data, countries, parameter, yearsRange]);

    return (
        <div>
            <div className="line-chart-container" ref={containerRef}></div>
        </div>
    );

    function createLineChart(container, data, countries, parameter, yearsRange) {
        const margin = { top: 20, right: 20, bottom: 50, left: 60 },
            width = 600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const years = createArray(yearsRange[0], yearsRange[1]);

        const minValue = d3.min(countries, country => 
            d3.min(years, year => +data[country][year][parameter] || Infinity)
        );

        const maxValue = d3.max(countries, country =>
            d3.max(years, year => +data[country][year][parameter] || 0)
        );

        const minYear = yearsRange[0] - 1;
        const maxYear = yearsRange[1] + 1;
        const range = maxValue - minValue;
        const extendedMinValue = minValue;
        const extendedMaxValue = maxValue + 0.1 * range;

        const unit = getMeasurementUnit(maxValue, true);

        const x = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([extendedMinValue, extendedMaxValue])
            .range([height, 0]);

        const xAxis = d3.axisBottom(x)
            .tickFormat(d3.format("d"));

        const yAxis = d3.axisLeft(y)
            .tickFormat(d => fixInUnit(d, unit, 1));

        const line = d3.line()
            .x(d => x(+d.year))
            .y(d => y(d.value));

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
                    .text(parameter + " (" + unit + " " + u(parameter) + ")");
        
        
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

        const lineGroups = svg.selectAll(".line-group")
            .data(countries);

        const lineGroupsEnter = lineGroups.enter().append("g")
            .attr("class", "line-group")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        lineGroupsEnter.merge(lineGroups).each(function (country, index) {
            const countryData = years.map(year => ({
                year,
                value: +data[country][year][parameter] || 0
            })).filter(d => d.value !== 0 && d.value !== '');

            const lines = d3.select(this).selectAll(".line")
                .data([countryData]);

            lines.enter().append("path")
                .attr("class", "line")
                .merge(lines)
                .attr("d", line)
                .style("fill", "none")
                .style("stroke", color(index))
                .transition()
                .duration(1000)
                .attr("d", line);

            lines.exit().remove();

            const dots = d3.select(this).selectAll(".dot")
                .data(countryData);

            dots.enter().append("circle")
                .attr("class", `dot ${country}`)
                .merge(dots)
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d.value))
                .attr("r", 3)
                .style("fill", color(index))
                .transition()
                .duration(1000)
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d.value));

            dots.exit().remove();
        });

        lineGroups.exit().remove();

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
};

export default LineChart;