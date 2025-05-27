import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkBrowserSupport, getBrowserSupportMessage } from '../utils/browserSupport';

const BrowserSupportNotice = () => {
    const [show, setShow] = useState(true);
    const [supportInfo, setSupportInfo] = useState({ type: 'loading' });

    useEffect(() => {
        // Check browser support
        const support = checkBrowserSupport();

        if (support.supportLevel !== 'full') {
            const message = getBrowserSupportMessage();
            setSupportInfo(message);
        } else {
            // If fully supported, just briefly show and hide
            setSupportInfo({ type: 'success', title: 'Ready', message: 'Voice chat ready!' });
            setTimeout(() => setShow(false), 3000);
        }
    }, []);

    if (!show || supportInfo.type === 'success') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
                <div className={`p-4 rounded-lg shadow-lg ${supportInfo.type === 'error' ? 'bg-red-600' :
                        supportInfo.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}>
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {supportInfo.type === 'error' && (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            {supportInfo.type === 'warning' && (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-white">
                                {supportInfo.title}
                            </h3>
                            <div className="mt-2 text-sm text-white">
                                <p>{supportInfo.message}</p>
                            </div>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setShow(false)}
                                    className="inline-flex rounded-md p-1.5 text-white hover:bg-opacity-20 hover:bg-white focus:outline-none"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BrowserSupportNotice;