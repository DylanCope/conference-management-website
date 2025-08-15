import './globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
	title: 'Conference Submissions Manager',
	description: 'Minimal app for managing conference submissions',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-white text-gray-900">
				{children}
			</body>
		</html>
	)
}

