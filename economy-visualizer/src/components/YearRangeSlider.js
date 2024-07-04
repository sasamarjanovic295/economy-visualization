import React, { useRef, useEffect, useState } from 'react';
import { Flex, Segmented, Slider, Select, Space, Typography, Button, Divider, Anchor, Layout, Col, Row, Image, Statistic } from 'antd';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';

const {Text, Link, Title} = Typography;

const YearRangeSlider = ({years, min, max, onChange}) => {

    return  <Space>
                <Space.Compact block>
                    <Button type="primary" disabled style={{width: "70px", textAlign: "center"}}>
                        <Text strong>{years[0]}</Text>
                    </Button>
                    <Slider range style={{marginInline: "13px",width: "285px"}} min={min} max={max} value={years} onChange={onChange}/>
                    <Button disabled type="primary" style={{width: "70px", textAlign: "center"}}>
                        <Text strong>{years[1]}</Text>
                    </Button>
                </Space.Compact>
            </Space>
}

export default YearRangeSlider;