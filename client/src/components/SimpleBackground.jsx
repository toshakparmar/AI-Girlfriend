import React, { useMemo } from 'react';

const SimpleBackground = ({ activeModel }) => {
    const gradientColor = useMemo(() => {
        if (!activeModel) return 'rgba(80, 80, 150, 0.2)';
        return `${activeModel.color}33`; // 33 is 20% opacity in hex
    }, [activeModel]);

    return (
        <div
            className="fixed top-0 left-0 w-full h-full z-[-1] overflow-hidden"
            style={{
                background: `
          radial-gradient(circle at 80% 10%, ${gradientColor}, transparent 60%),
          radial-gradient(circle at 10% 90%, ${gradientColor}, transparent 60%),
          #050510
        `
            }}
        >
            {/* Animated dots */}
            {Array.from({ length: 30 }).map((_, i) => (
                <div
                    key={`dot-${i}`}
                    className="absolute rounded-full"
                    style={{
                        backgroundColor: activeModel ? activeModel.color : '#ffffff',
                        width: `${Math.random() * 4 + 1}px`,
                        height: `${Math.random() * 4 + 1}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: 0.2,
                        boxShadow: activeModel ? `0 0 5px ${activeModel.color}` : '0 0 5px #ffffff',
                        animation: `float ${Math.random() * 4 + 3}s infinite ease-in-out`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
        </div>
    );
};

export default SimpleBackground;