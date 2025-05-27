import { motion } from "framer-motion";

const VoiceControls = ({ isListening, onStartListening, activeModel }) => {
    return (
        <div className="p-5 flex flex-col gap-4 bg-[rgba(10,10,15,0.8)] border-t border-white/5">
            <motion.button
                className={`talk-button ${isListening ? 'listening' : ''}`}
                onClick={onStartListening}
                disabled={isListening}
                style={{
                    background: isListening
                        ? 'linear-gradient(135deg, #ff4141, #ff6b6b)'
                        : `linear-gradient(135deg, ${activeModel.color}, ${activeModel.color}80)`
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
            >
                <i className={`fas ${isListening ? 'fa-microphone-alt' : 'fa-microphone'} text-xl`}></i>
                {isListening ? 'Listening...' : 'Start Talking'}
            </motion.button>
            <audio id="audio" className="hidden" />
        </div>
    );
};

export default VoiceControls;