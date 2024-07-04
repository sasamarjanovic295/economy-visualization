import React, { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import data from './data/merged_data.json';
import mapData from './data/countries-50m.json';
import logo from './assets/logo.png'
import './style/App.css'
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';
import PieChart from './components/PieChart';
import Chart from './components/Chart';
import { Flex, Segmented, Slider, Select, Space, Typography, Button, Divider, Anchor, Layout, Col, Row, Image, Statistic } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { formatNumber } from './services/NumberService';
import { style } from 'd3';
import YearSlider from './components/YearSlider';

const { Header, Footer, Sider, Content } = Layout;
const {Text, Link, Title} = Typography;
const COMPARE_COUNT = 5;


const App = () => {
    const [year, setYear] = useState(2020);
    const [country, setCountry] = useState('World');
    const [parameter, setParameter] = useState('gdp');
    const [countriesToComapre, setCountries] = useState([]);

    const options = Object.keys(data).map(country => ({
        value: country,
        label: country
    }));

    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const suffix = (
        <div style={{backgroundColor: "white"}}>
          <span>
            {countriesToComapre.length} / {COMPARE_COUNT}
          </span>
          <DownOutlined />
        </div>
    );

    return (
        <Layout style={{width: "100%"}}>
            <Header style={{position: 'fixed', top: 0, zIndex: 1, width: '100%',}}>
                <Flex align='center' justify='flex-start' style={{height: "100%"}} gap={5}>
                    <Image width={30} src={logo} preview={false}/>
                    <Title level={1} style={{margin: 0, color: 'white'}}>Economic Data</Title>
                    <Anchor
                        style={{marginLeft: "auto"}}
                        direction="horizontal"
                        affix={false}
                        getCurrentAnchor={"#"}
                        items={[
                            {
                                key: '1',
                                href: '#visualization',
                                title: 'Visualization',
                            },
                            {
                                key: '2',
                                href: '#management',
                                title: 'Management',
                            }
                        ]}
                    />
                </Flex>
            </Header>
            <Content>
                <Flex id='visualization' style={{width: "100%"}} align='center' justify='flex-start' vertical>
                    <Flex style={{marginTop: "100px"}} justify='space-evenly' gap={100} wrap>
                        <Flex align='flex-start' justify='flex-start' vertical>
                            <Space>
                                <Segmented
                                    options={['GDP', 'GDPPC', 'Inflation']}
                                    onChange={(value) => {
                                        setParameter(value.toLocaleLowerCase()); 
                                    }}
                                />
                                <Select
                                    style={{width: "220px"}}
                                    showSearch
                                    placeholder="Select a country"
                                    optionFilterProp="children"
                                    onChange={ value => {setCountry(value); setCountries([]);}}    
                                    filterOption={filterOption}                       
                                    options={options}
                                    value={country}
                                />
                                <Space.Compact block>
                                    <YearSlider year={year} min={1970} max={2022} onChange={setYear} ></YearSlider> 
                                </Space.Compact>
                            </Space>
                            <WorldMap mapData={mapData} data={data} parameter={parameter} year={year} setCountry={setCountry}/>
                        </Flex>
                        <Flex style={{height: "initial"}} align='center' justify='center' vertical gap={10}>
                            <Flex align='center' justify='center' vertical>
                                <Text strong type="secondary" style={{fontSize: "17px"}}>COUNTRY</Text>
                                <Title level={2} style={{margin: 0}}>{country}</Title>
                            </Flex>
                            <Flex style={{marginTop: "10px"}} align='center' justify='center' vertical>
                                <Text strong type="secondary" style={{fontSize: "17px"}}>YEAR</Text>
                                <Title level={3} style={{margin: 0}}>{year}</Title>
                            </Flex>
                            <Flex align='center' justify='center' vertical>
                                <Text strong type="secondary" style={{fontSize: "17px"}}>GDP</Text>
                                <Title level={4} style={{margin: 0}}>$ {formatNumber(data[country][year]['gdp'], true)}</Title>
                            </Flex>
                            <Flex align='center' justify='center' vertical>
                                <Text strong type="secondary" style={{fontSize: "17px"}}>GDPPC</Text>
                                <Title level={4} style={{margin: 0}}>$ {formatNumber(data[country][year]['gdppc'], true)}</Title>
                            </Flex>
                            <Flex align='center' justify='center' vertical>
                                <Text strong type="secondary" style={{fontSize: "17px"}}>INFLATION</Text>
                                <Title level={4} style={{margin: 0}}>{formatNumber(data[country][year]['inflation'], false, 4)} %</Title>
                            </Flex>
                            <Flex style={{marginTop: "10px"}} align='center' justify='center' vertical>
                                <Title level={3} style={{margin: 0}}>Copmpare to</Title>
                                <Select
                                    mode="multiple"
                                    maxCount={COMPARE_COUNT}
                                    value={countriesToComapre}
                                    allowClear
                                    style={{
                                        width: '300px',
                                        marginTop: "5px"
                                    }}
                                    placeholder="Please select countries"
                                    suffixIcon={suffix}
                                    onChange={setCountries}
                                    options={options.filter((cnt) => cnt.label !== country)}
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex align='flex-start' justify='space-evenly' wrap>                   
                        <Chart data={data} countries={[country, ...countriesToComapre]} parameter={'gdp'} year={year}></Chart>
                        <Chart data={data} countries={[country, ...countriesToComapre]} parameter={'gdppc'} year={year}></Chart>
                        <Chart style={{marginTop: "300px"}} data={data} countries={[country, ...countriesToComapre]} parameter={'inflation'} year={year}></Chart>
                    </Flex>
                </Flex>
            </Content>
            <Footer>

            </Footer>
        </Layout>
    );
};

export default App;