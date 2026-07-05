import React from 'react';

const Conversations = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-center p-6 max-w-sm">

                {/* Modern Icon with a subtle dashed border instead of solid background */}
                <div className="flex items-center justify-center w-16 h-16 mb-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 dark:text-gray-500">
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>

                {/* Typography Enhancements */}
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
                    Chatnova<span className="text-blue-500">AI</span>
                </h1>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[260px]">
                    Select a chat from the sidebar to start messaging.
                </p>

            </div>
        </div>
    )
}

export default Conversations;