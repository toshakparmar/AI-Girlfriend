import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const BackgroundParticles = ({ activeModel }) => {
    const particlesInit = useCallback(async (engine) => {
        // This is the correct way to initialize tsparticles
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container) => {
        // Optional callback when particles are loaded
    }, []);

    const particlesOptions = {
        fpsLimit: 60,
        particles: {
            number: {
                value: 20,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: activeModel ? activeModel.color : "#ffffff"
            },
            opacity: {
                value: 0.2,
                random: true
            },
            size: {
                value: 1.5,
                random: true
            },
            links: {
                enable: true,
                distance: 150,
                color: activeModel ? activeModel.color : "#ffffff",
                opacity: 0.15,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.7,
                direction: "none",
                random: true,
                outModes: {
                    default: "out"
                }
            }
        },
        interactivity: {
            detectsOn: "canvas",
            events: {
                onHover: {
                    enable: true,
                    mode: "grab"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    links: {
                        opacity: 0.3
                    }
                }
            }
        },
        detectRetina: true,
        background: {
            color: {
                value: "transparent"
            }
        }
    };

    // If no model is active, return null to avoid rendering particles
    if (!activeModel) {
        return null;
    }

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={particlesOptions}
            className="fixed top-0 left-0 w-full h-full z-[-1]"
        />
    );
};

export default BackgroundParticles;