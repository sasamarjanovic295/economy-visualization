import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { fixInUnit, formatNumber, dollarSign, percentSign, unit } from '../services/NumberService';
import '../style/WorldMap.css'
import { Button } from 'antd';

const WorldMap = ({ mapData, data, parameter, year, setCountry, width = 900, height = 500}) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const [tooltip, setTooltip] = useState({ content: {country: '', value: ''}, position: { x: 0, y: 0 }, visibility: false });
    const [tooltipX, setTooltipX] = useState(0);
    const [tooltipY, setTooltipY] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    const zoom = useMemo(() => {
        return d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                const svg = d3.select(svgRef.current);
                svg.selectAll('path')
                    .attr("transform", event.transform);
                if(event.transform.k !== 1 || event.transform.x !== 0 || event.transform.y !== 0){
                    setZoomed(true);
                    if(event.sourceEvent) {
                        svg.selectAll('.button-group')
                            .style('display', 'block')
                    }
                }
                else {
                    setZoomed(false);
                    svg.selectAll('.button-group')
                        .style('display', 'none')
                }
            });
    }, []); 
    
    useEffect(() => {
        const projection = d3.geoMercator()
            .translate([width / 2, height / 2])
            .scale(150);

        const path = d3.geoPath().projection(projection);

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "#F7F0E8")

        svg.call(zoom);

        const statesData = topojson.feature(mapData, mapData.objects.countries).features;

        svg.selectAll('path.country')
            .data(statesData)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path)
            .style('fill', '#EEE9E2')
            .style('stroke', 'grey')
            .style('stroke-width', 0.5)
            .on('mouseover', (event, d) => {
                const countryName = d.properties.name;
                const countryData = data[countryName];
                if (countryData) {
                    const value = countryData[year][parameter];
                    if (value) {
                        setTooltip({
                            content: {country: countryName, value: value},
                            position: { x: event.pageX, y: event.pageY },
                            visibility: true
                        });
                    } else {
                        setTooltip({
                            content: {country: countryName, value: ''},
                            position: { x: event.pageX, y: event.pageY },
                            visibility: true
                        });
                    }
                } else {
                    setTooltip({
                        content: {country: countryName, value: ''},
                        position: { x: event.pageX, y: event.pageY },
                        visibility: true
                    });
                }
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
            })
            .on('click', (event, d) => {
                const bounds = path.bounds(d);
                const dx = bounds[1][0] - bounds[0][0];
                const dy = bounds[1][1] - bounds[0][1];
                const x = (bounds[0][0] + bounds[1][0]) / 2;
                const y = (bounds[0][1] + bounds[1][1]) / 2;
                const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
                const translate = [width / 2 - scale * x, height / 2 - scale * y];

                svg.transition()
                    .duration(750)
                    .call(
                        zoom.transform,
                        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                    )
                    .end()
                    .then(() => {
                        svg.selectAll('.button-group')
                            .style('display', 'block');
                    });

                const countryName = d.properties.name;
                setCountry(countryName);
                setZoomed(true);
            });

        // Initial coloring of the map
        colorMap(svg, data, parameter, year);


    }, [mapData, data]);

    useEffect(() => {
        if (tooltip.visibility && tooltipRef.current) {
            const tooltipElement = tooltipRef.current;
            const tooltipRect = tooltipElement.getBoundingClientRect();
            setTooltipX(tooltip.position.x  - tooltipRect.width / 2);
            setTooltipY(tooltip.position.y - tooltipRect.height / 2 - 20);
        }
    }, [tooltip.visibility, tooltip.position]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        colorMap(svg, data, parameter, year);
        console.log('clrmap')
    }, [data, parameter, year]);

    const colorMap = (svg, data, parameter, year) => {
        var minValue = d3.min(Object.values(data), country => +country[year][parameter] || Infinity);
        var maxValue = d3.max(Object.values(data), country => +country[year][parameter] || 0);
        var positiveOffset = 0;

        const colorScale = d3.scaleLog();

        if (minValue < 0) {
            positiveOffset = Math.ceil(Math.abs(minValue));
        };

        colorScale.domain([minValue + positiveOffset, maxValue + positiveOffset])
            .range(['rgb(247,251,255)', 'rgb(8,81,156)']);

        svg.selectAll('path.country')
            .on('mouseover', (event, d) => {
                const countryName = d.properties.name;
                const countryData = data[countryName];
                if (countryData) {
                    const value = countryData[year][parameter];
                    if (value) {
                        setTooltip({
                            content: {country: countryName, value: value},
                            position: { x: event.pageX, y: event.pageY },
                            visibility: true
                        });
                    } else {
                        setTooltip({
                            content: {country: countryName, value: ''},
                            position: { x: event.pageX, y: event.pageY },
                            visibility: true
                        });
                    }
                } else {
                    setTooltip({
                        content: {country: countryName, value: ''},
                        position: { x: event.pageX, y: event.pageY },
                        visibility: true
                    });
                }
            })
            .on('mousemove', (event) => {
                setTooltip(prevTooltip => ({
                    ...prevTooltip,
                    position: { x: event.pageX, y: event.pageY }
                }));
            })
            .transition()
            .duration(1000) 
            .style("fill", d => {
                const countryName = d.properties.name;
                const countryData = data[countryName];
                if (countryData) {
                    const value = countryData[year][parameter];
                    return value ? colorScale(value + positiveOffset) : "white";
                }
                return "white";
            })
            .style("fill-opacity", 0.9);
        
            addScale(svg, minValue, maxValue, positiveOffset, parameter);
    };

    function generateLogScaleTicks(scale, scaleHeight, count) {
        const step = scaleHeight / count;
        var tickValues = [];
        for(var i = 0.5; i <= count; i++){
            tickValues.push(scale.invert(i*step));
        }

        return tickValues;
    }


    const addScale = (svg, minValue, maxValue, positiveOffset, parameter) => {
        const scaleHeight = 100; // Height of the scale
        const scaleWidth = 20; // Width of the scale
    
        const legendGroup = svg.selectAll(".legend-group").data([null]);
    
        const legendGroupEnter = legendGroup.enter().append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(10, ${height - scaleHeight - 50})`);
    
        const legendGroupMerge = legendGroupEnter.merge(legendGroup);
    
        legendGroupMerge.selectAll("*").remove();
    
        legendGroupMerge.append("rect")
            .attr("class", "legend-background")
            .attr("y", 0)
            .attr("x", 0)
            .attr("width", scaleWidth + 70)
            .attr("height", scaleHeight + 40)
            .style("fill", "white")
            .style("fill-opacity", 0.9);
    
        const gradient = legendGroupMerge.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
    
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", 'rgb(8,81,156)');
    
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", 'rgb(247,251,255)');
    
        // Add the rectangle with the gradient
        legendGroupMerge.append("rect")
            .attr("class", "legend-gradient")
            .attr("x", 10)
            .attr("y", 30)
            .attr("width", scaleWidth)
            .attr("height", scaleHeight)
            .style("fill", "url(#legend-gradient)");
    
        const scale = d3.scaleLog();
        scale.domain([minValue + positiveOffset, maxValue + positiveOffset])
            .range([scaleHeight, 0]);

        const tickValues = generateLogScaleTicks(scale, scaleHeight, 6);
    
        const legendAxis = d3.axisRight(scale)
            .tickFormat(d => formatNumber(d - positiveOffset, false, 0))
            .tickValues(tickValues)
    
        legendGroupMerge.append("g")
            .attr("class", "legend-axis")
            .attr("transform", "translate(30,30)")
            .call(legendAxis);

        const buttonGroup = svg.append('g')
            .attr('class', 'button-group')
            .attr('transform', `translate(10, ${height - scaleHeight - 90})`)
            .style('display', zoomed ? 'block' : 'none')
            .on('mouseenter', function(event){
                console.log(event)
                svg.selectAll('.button-group').selectAll('text')
                    .style("font-weight", "bold");
            })
            .on('mouseout', function(event){
                console.log(event)
                svg.selectAll('.button-group').selectAll('text')
                    .style("font-weight", "normal");
            });

        buttonGroup.append('rect')
            .attr('width', scaleWidth + 70)
            .attr('height', 30)
            .attr('rx', 5) 
            .style("fill", "white")
            .style("fill-opacity", 0.9)
            .style('cursor', 'pointer')
            .on('click', () => {
                const scale = 1;
                const translate = [0, 0];
                d3.select(svgRef.current).transition()
                    .duration(750)
                    .call(
                        zoom.transform,
                        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                    );
            });

        buttonGroup.append('text')
            .attr('x', (scaleWidth + 70) / 2)
            .attr('y', 15) 
            .attr('text-anchor', 'middle') 
            .attr('alignment-baseline', 'middle') 
            .style("font-size", "12px")
            .style("fill", "black")
            .style('pointer-events', 'none') 
            .text('Reset View');

        legendGroupMerge.append("text")
            .attr("class", "legend-title")
            .attr("x", scaleWidth / 2 )
            .attr("y", 20)
            .text(`${parameter} (${unit(parameter)})`)
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "black");
    
        legendGroup.exit().remove();
    };

    const tooltipStyle = {
        position: 'absolute',
        top: tooltipY,
        left: tooltipX,
        visibility: tooltip.visibility ? 'visible' : 'hidden',
        background: 'white',
        border: '1px solid grey',
        padding: '5px'
    };

    return (
        <div >
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} style={tooltipStyle} className="tooltip">
                <b>{tooltip.content.country}</b>{tooltip.content.value !== '' ? 
                ': ' + dollarSign(parameter) + formatNumber(tooltip.content.value) + percentSign(parameter) : ''}
            </div>
        </div>
    );
};

export default WorldMap;
