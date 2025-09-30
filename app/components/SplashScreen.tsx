'use client'

import React from 'react';

type SplashScreenProps = {
	message?: string;
	opaque?: boolean;
};

export default function SplashScreen({ message, opaque = true }: SplashScreenProps) {
	return (
		<div className={`fixed inset-0 z-50 flex items-center justify-center ${opaque ? 'bg-black' : ''}`}>
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
				<p className="text-gray-400">{message || 'Loading...'}</p>
			</div>
		</div>
	);
}


