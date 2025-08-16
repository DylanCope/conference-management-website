import './globals.css'
import type { Metadata } from 'next'
import React from 'react'
import { Inter } from 'next/font/google'
import ThemeToggle from './components/ThemeToggle'

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
			<body className="min-h-screen">
				{/* Prevent flash: compute theme class before hydration */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(() => { try {
							document.documentElement.classList.add('theme-init');
							const s = localStorage.getItem('theme');
							const useDark = s ? s === 'dark' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
							if (useDark) document.documentElement.classList.add('dark');
							else document.documentElement.classList.remove('dark');
							setTimeout(() => document.documentElement.classList.remove('theme-init'), 0);
						} catch(e) {} })();`,
					}}
				/>
				<div className="page-wrap">
					<div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, padding:'12px 0'}}>
						<div style={{fontWeight:600}}>Conference Submissions Manager</div>
						<ThemeToggle />
					</div>
					{children}
				</div>
			</body>
		</html>
	)
}

