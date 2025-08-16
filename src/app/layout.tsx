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
			<head>
				{/* Hint UA and set theme before any paint */}
				<meta name="color-scheme" content="light dark" />
				<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#22252A" />
				<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
				<script
					dangerouslySetInnerHTML={{
						__html: `(() => { try {
							const root = document.documentElement;
							root.classList.add('theme-init');
							const s = localStorage.getItem('theme');
							const useDark = s ? s === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
							if (useDark) {
								root.classList.add('dark');
								// Inline CSS variables for immediate paint
								root.style.setProperty('--bg', '#22252A');
								root.style.setProperty('--text', '#ADB2B1');
								root.style.setProperty('--card', '#292C33');
								root.style.setProperty('--border', '#353941');
								root.style.setProperty('--muted', '#c0c6c5');
								root.style.setProperty('--danger', '#ff6b6b');
								root.style.setProperty('--success', '#34d399');
								root.style.backgroundColor = '#22252A';
								if (document.body) document.body.style.backgroundColor = '#22252A';
							} else {
								root.classList.remove('dark');
								root.style.setProperty('--bg', '#ffffff');
								root.style.setProperty('--text', '#111111');
								root.style.setProperty('--card', '#ffffff');
								root.style.setProperty('--border', '#e5e7eb');
								root.style.setProperty('--muted', '#4b5563');
								root.style.setProperty('--danger', '#ef4444');
								root.style.setProperty('--success', '#10b981');
								root.style.backgroundColor = '#ffffff';
								if (document.body) document.body.style.backgroundColor = '#ffffff';
							}
							setTimeout(() => root.classList.remove('theme-init'), 0);
						} catch(e) {} })();`,
					}}
				/>
			</head>
			<body className="min-h-screen">
				<div className="page-wrap">
					<div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, padding:'12px 0'}}>
						<div style={{fontWeight:700, fontSize:24}}>Conference Submissions Manager</div>
						<ThemeToggle />
					</div>
					{children}
				</div>
			</body>
		</html>
	)
}

