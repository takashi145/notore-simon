import { useEffect, useState } from 'preact/hooks'

interface LayoutProps {
	children: preact.ComponentChildren
}

const getInitialDarkMode = (): boolean => {
	const theme = localStorage.getItem('theme')
	if (theme) {
		return theme === 'dark'
	} else {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}
}

export const Layout = ({ children }: LayoutProps) => {
	const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode)

	useEffect(() => {
		const initialDarkMode = getInitialDarkMode()
		setIsDarkMode(initialDarkMode)
	}, [])

	// ダークモード切り替え
	const toggleDarkMode = () => {
		const newDarkMode = !isDarkMode
		setIsDarkMode(newDarkMode)
		localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
	}

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [isDarkMode])

	return (
		<div class="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col">
			<div class="absolute top-4 left-4 z-10">
				<button
					onClick={toggleDarkMode}
					class="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
					title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
				>
					{isDarkMode ? (
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-yellow-400">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-gray-700">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
						</svg>
					)}
				</button>
			</div>

			<div class="flex-1 flex items-center justify-center">
				{children}
			</div>
			<footer class="p-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">
				© 2025 <a href="https://github.com/takashi145" class="underline hover:text-blue-600 dark:hover:text-blue-400">takashi145</a>
			</footer>
		</div>
	)
}
