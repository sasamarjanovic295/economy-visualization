import React, { useEffect, useRef } from 'react';

const Tooltip = ({ position, content, visibility }) => {
    const tooltipRef = useRef();

    useEffect(() => {
        const { x, y } = position;
        const tooltip = tooltipRef.current;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.visibility = visibility ? 'visible' : 'hidden';
    }, [position, visibility]);

    return (
        <div ref={tooltipRef} className="tooltip" style={{ position: 'absolute', background: 'white', border: '1px solid grey', padding: '5px' }}>
            {content}
        </div>
    );
};

export default Tooltip;
