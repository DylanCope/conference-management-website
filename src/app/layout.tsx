import './globals.css'
import type { Metadata } from 'next'
import React from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

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
		<html lang="en" className={inter.className}>
			<body className="min-h-screen bg-white text-gray-900">
				<div className="page-wrap">
					{children}
				</div>
			</body>
		</html>
	)
}

