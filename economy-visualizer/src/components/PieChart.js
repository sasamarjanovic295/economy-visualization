import React, { useRef, useEffect, useState } from 'react';
import { fixInUnit, formatNumber, dollarSign, percentSign, unit } from '../services/NumberService';
import * as d3 from 'd3';


const PieChart = ({ data, countries, parameter, year }) => {
    const containerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [tooltip, setTooltip] = useState({ content: {country: '', value: ''}, position: { x: 0, y: 0 }, visibility: false });
    const [tooltipX, setTooltipX] = useState(0);
    const [tooltipY, setTooltipY] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            createPieChart(containerRef.current, data, countries, parameter, year);
        }
    }, [data, countries, parameter, year]);

    useEffect(() => {
        if (tooltip.visibility && tooltipRef.current) {
            const tooltipElement = tooltipRef.current;
            const tooltipRect = tooltipElement.getBoundingClientRect();
            setTooltipX(tooltip.position.x  - tooltipRect.width / 2);
            setTooltipY(tooltip.position.y - tooltipRect.height / 2 - 20);
        }
    }, [tooltip.visibility, tooltip.position]);

    const tooltipStyle = {
        position: 'absolute',
        top: tooltipY,
        left: tooltipX,
        visibility: tooltip.visibility ? 'visible' : 'hidden',
        background: 'white',
        border: '1px solid grey',
        padding: '5px'
    };

    return  <div>
                <div className="pie-chart-container" ref={containerRef}></div>
                <div ref={tooltipRef} style={tooltipStyle} className="tooltip">
                    <b>{tooltip.content.country}</b>{tooltip.content.value !== '' || tooltip.content.value !== 0 ? 
                    ': ' + formatNumber(tooltip.content.value, false, 2) + ' %' : 'No data'}
                </div>
            </div>


    function createPieChart(container, data, countries, parameter, year) {
        var width = 600,
            height = 400,
            radius = Math.min(width, height) / 2;

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        let svg = d3.select(container).select("svg");

        if (svg.empty()) {
            const svg = d3.select(container).append("svg")
                .attr("width", width)
                .attr("height", height)
        }

        var arc = d3.arc()
            .outerRadius(radius - 20)
            .innerRadius(0);

        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d.value; });

        var yearData = countries.map(function(country) {
            console.log(country, year, parameter);
            return {
                country: country,
                value: data[country][year][parameter] || 0
            };
        });

        var totalValue = d3.sum(yearData, function(d) {
            return d.value;
        });

        svg.selectAll(".arc").remove();

        var g = svg.selectAll(".arc")
            .data(pie(yearData))
            .enter().append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + radius + "," + height / 2 + ")");;

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d, i) { return color(i); })
            .on('mouseover', (event, d, i) => {
                let value = d.value !== '' || d.value !== 0 ? d.value / totalValue * 100 : 0;
                var country = yearData.find(x => x.value === d.value).country;
                setTooltip({
                    content: {country: country, value: value},
                    position: { x: event.pageX, y: event.pageY },
                    visibility: true
                });
            })
            .on('mousemove', (event) => {
                setTooltip(prevTooltip => ({
                    ...prevTooltip,
                    position: { x: event.pageX, y: event.pageY }
                }));
            })
            .on('mouseout', () => {
                setTooltip(prevTooltip => ({
                    ...prevTooltip,
                    visibility: false
                }));
            });


        var legend = svg.selectAll(".legend")
            .data(countries);

        var legendEnter = legend.enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + `${height / 2 + i * 20})`);

        legendEnter.append("rect")
            .attr("x", width - 38)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d, i) => color(i));

        legendEnter.append("text")
            .attr("x", width - 42)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("fill", "grey")
            .text(d => d);

        var legendUpdate = legendEnter.merge(legend)
            .attr("transform", (d, i) => "translate(0," + `${height / 2 + i * 20})`);

        legendUpdate.select("rect")
            .style("fill", (d, i) => color(i))
            .on('mouseover', (event, d) => {
                var value = yearData.find(x => x.country === d).value;
                value = value !== '' || value !== 0 ? value / totalValue * 100 : 0;
                setTooltip({
                    content: {country: d, value: value},
                    position: { x: event.pageX, y: event.pageY },
                    visibility: true
                });
            })
            .on('mousemove', (event) => {
                setTooltip(prevTooltip => ({
                    ...prevTooltip,
                    position: { x: event.pageX, y: event.pageY }
                }));
            })
            .on('mouseout', () => {
                setTooltip(prevTooltip => ({
                    ...prevTooltip,
                    visibility: false
                }));
            });

        legendUpdate.select("text")
            .text(d => d);

        legend.exit().remove();

        svg.selectAll(".alt").remove()

        if(countries.length === 1 && yearData[0].value === 0) {
            svg.append("text")
                .attr("class", "alt")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .style("fill", "grey")
                .style("font-weight", "bold")
                .style("font-size", "20px")
                .text(`No data for year ${year}`);
        }
    }
}

export default PieChart;