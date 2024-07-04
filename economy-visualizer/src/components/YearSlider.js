// YearSlider.js

import React, { useEffect, useRef, useState } from 'react';
import { Button, Slider, Space, Typography } from 'antd';

const { Text } = Typography;

const YearSlider = ({ year, min, max, onChange }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const intervalRef = useRef(null);

    const handleChange = (newYear) => {
        onChange(newYear);
    };

    const handleAnimate = () => {
        setIsAnimating(true);
        onChange(min);

        const setYear = () => {
            onChange(prevYear => {
                const newYear = prevYear + 1;
                if (newYear >= max) {
                    handleStop();
                    return max;
                }
                return newYear;
            });
        };

        intervalRef.current = setInterval(setYear, 1500);
    };

    const handleStop = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsAnimating(false);
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    return (
        <Space>
            <Space.Compact block>
                <Button type="primary" disabled style={{ width: "70px", textAlign: "center" }}>
                    <Text strong>{year}</Text>
                </Button>
                <Slider disabled={isAnimating} style={{ marginInline: "13px", width: "285px" }} min={min} max={max} value={year} onChange={handleChange} />
                {isAnimating ? (
                    <Button type="primary" onClick={handleStop}>Stop</Button>
                ) : (
                    <Button type="primary" onClick={handleAnimate}>Animate</Button>
                )}
            </Space.Compact>
        </Space>
    );
};

export default YearSlider;