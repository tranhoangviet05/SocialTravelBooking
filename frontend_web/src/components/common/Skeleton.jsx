import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className = '', width, height, variant = 'rect' }) => {
    const style = {
        width: width || '100%',
        height: height || '1rem',
    };

    const variantClasses = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded',
    };

    return (
        <div 
            className={`skeleton ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
