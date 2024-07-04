import React, { useRef, useEffect, useState } from 'react';
import { Flex, Segmented, Slider, Select, Space, Typography, Button, Divider, Anchor, Layout, Col, Row, Image, Statistic } from 'antd';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import YearSlider from './YearSlider';
import * as d3 from 'd3';
import YearRangeSlider from './YearRangeSlider';

const {Text, Link, Title} = Typography;

const Chart = ({data, countries, parameter, year}) => {
    const containerRef = useRef(null);
    const [tooltip, setTooltip] = useState({ content: '', position: { x: 0, y: 0 }, visibility: false });
    const [type, setType] = useState('line')
    const [years, setYears] = useState([1990, 2010]);
    const [pieYear, setYear] = useState(2010);
    const [min, setMin] = useState(1990);
    const [max, setMax] = useState(2010);

    useEffect(() => {
        var minYear = d3.min(countries, country =>
            d3.min(Object.keys(data[country]), year =>
                data[country][year][parameter] !== "" ? +year : Infinity
            )
        );
        var maxYear = d3.max(countries, country =>
            d3.max(Object.keys(data[country]), year => 
                data[country][year][parameter] !== "" ? +year : 0
            )
        );
        setYears([minYear, maxYear]);
        setMin(minYear);
        setMax(maxYear);

        if (pieYear < minYear) {
            setYear(minYear);
        }
    },[countries]);

    useEffect(() => {
        if (year < min) {
            setYear(min);
        } else {
            setYear(year);
        }
    }, [year]);


    const label = (parameter) => {
        switch(parameter) {
            case 'gdp': return 'Gross Domestic Product';
            case 'gdppc': return 'Gross Domestic Product per Capita';
            case 'inflation': return 'Inflation';
        }
    }

    const chart = (type, data, countries, parameter, year, years) => {
        switch(type) {
            case 'line': return <LineChart data={data} countries={countries} parameter={parameter} yearsRange={years}></LineChart>;
            case 'bar': return <BarChart data={data} countries={countries} parameter={parameter} yearsRange={years}></BarChart>;
            case 'pie': return year ? <PieChart data={data} countries={countries} parameter={parameter} year={pieYear}></PieChart> : `year = ${year}`;
        }
    }

    return  <Flex  style={{marginTop: "30px"}} align='center' justify='flex-start' vertical gap={20}>
                <Title style={{margin: 0}} level={4}>{label(parameter)}</Title>   
                <Space>
                    <Text>Chart: </Text>
                    <Segmented
                        options={['Line', 'Bar', 'Pie']}
                        onChange={(value) => {
                            setType(value.toLocaleLowerCase()); 
                        }}
                    />
                </Space>
                {chart(type, data, countries, parameter, year, years)}
                {
                    type === 'pie' 
                    ? <YearSlider year={[pieYear]} years={years} min={min} max={max} onChange={setYear} ></YearSlider> 
                    : <YearRangeSlider years={years} min={min} max={max} onChange={setYears}></YearRangeSlider>
                }
            </Flex>

}

export default Chart;