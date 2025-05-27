import { motion } from "framer-motion";

const ModelCard = ({ model, isActive, onClick, index, isFullView }) => {
    // Card animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        hover: {
            scale: isFullView ? 1.05 : 1.03,
            y: isFullView ? -10 : -5,
            boxShadow: `0 0 25px ${model.color}80`
        }
    };

    return (
        <motion.div
            className={`model-card ${isActive ? 'active' : ''}`}
            style={{
                borderColor: isActive ? model.color : 'transparent',
                boxShadow: isActive ? `0 0 15px ${model.color}80` : 'none'
            }}
            onClick={onClick}
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
        >
            {isFullView && (
                <div
                    className="h-[200px] md:h-[180px] lg:h-[200px] bg-cover bg-center relative flex items-center justify-center transition-all duration-500"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.8)), url('/images/model-${model.id}.jpg')`,
                    }}
                >
                    <div
                        className="absolute -bottom-7 left-6 w-[70px] h-[70px] rounded-full flex items-center justify-center text-2xl text-white shadow-lg z-10"
                        style={{ backgroundColor: model.color }}
                    >
                        <i className={`fas ${model.id === 1 ? 'fa-heart' :
                                model.id === 2 ? 'fa-laptop-code' :
                                    model.id === 3 ? 'fa-kiss-wink-heart' :
                                        'fa-comment-slash'
                            }`}></i>
                    </div>
                </div>
            )}

            {!isFullView && (
                <div
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-xl text-white shadow-lg mx-auto mt-6 mb-4"
                    style={{ backgroundColor: model.color }}
                >
                    <i className={`fas ${model.id === 1 ? 'fa-heart' :
                            model.id === 2 ? 'fa-laptop-code' :
                                model.id === 3 ? 'fa-kiss-wink-heart' :
                                    'fa-comment-slash'
                        }`}></i>
                </div>
            )}

            <div className="px-6 py-5 flex flex-col flex-1">
                <h3 className={`font-semibold ${isFullView ? 'text-2xl mt-2' : 'text-xl'} mb-2`}>
                    {model.name}
                </h3>
                <p className="text-sm text-gray-300 mb-5">
                    {model.description}
                </p>

                {isFullView && (
                    <div className="flex flex-col gap-3 my-4 py-4 border-t border-b border-white/10">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <i className="fas fa-comment text-white/70"></i>
                            <span>Communication Style: {model.id === 1 ? 'Sweet' :
                                model.id === 2 ? 'Analytical' :
                                    model.id === 3 ? 'Playful' : 'Blunt'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <i className="fas fa-brain text-white/70"></i>
                            <span>Personality: {model.id === 1 ? 'Empathetic' :
                                model.id === 2 ? 'Logical' :
                                    model.id === 3 ? 'Fun-loving' : 'Direct'}</span>
                        </div>
                    </div>
                )}

                <div
                    className="bg-white/10 rounded-full flex items-center justify-between transition-all duration-300 mt-auto py-3 px-6 text-base font-medium"
                    style={{
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : undefined
                    }}
                >
                    <span>Select {model.name}</span>
                    <i className="fas fa-chevron-right text-xs opacity-70"></i>
                </div>
            </div>
        </motion.div>
    );
};

export default ModelCard;