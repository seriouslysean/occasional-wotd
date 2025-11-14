/**
 * Theme Manager
 * Handles themed month detection and loading
 */

export interface ThemeConfig {
	enabled: boolean;
	month: number; // 1-12
}

export interface ThemeSettings {
	february?: ThemeConfig;
	april?: ThemeConfig;
	july?: ThemeConfig;
	september?: ThemeConfig;
	october?: ThemeConfig;
	november?: ThemeConfig;
	december?: ThemeConfig;
	birthday?: {
		enabled: boolean;
		date?: string; // MM-DD format
	};
	forceTheme?: string; // For testing/demo purposes
}

/**
 * Get the active theme based on current date and configuration
 */
export function getActiveTheme(
	currentDate: Date,
	settings: ThemeSettings,
): string | null {
	// 1. Check for forced theme (testing/demo)
	if (settings.forceTheme) {
		return settings.forceTheme;
	}

	const month = currentDate.getMonth() + 1; // 0-indexed to 1-indexed
	const dateStr = `${String(month).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

	// 2. Check birthday (highest priority for natural dates)
	if (settings.birthday?.enabled && settings.birthday?.date === dateStr) {
		return 'birthday';
	}

	// 3. Check monthly themes
	const themeMap: Record<number, keyof ThemeSettings> = {
		2: 'february',
		4: 'april',
		7: 'july',
		9: 'september',
		10: 'october',
		11: 'november',
		12: 'december',
	};

	const themeKey = themeMap[month];
	if (themeKey && themeKey !== 'birthday') {
		const theme = settings[themeKey] as ThemeConfig | undefined;
		if (theme?.enabled) {
			return themeKey;
		}
	}

	return null;
}

/**
 * Client-side helper to detect URL parameter override
 */
export function getThemeFromURL(): string | null {
	if (typeof window === 'undefined') return null;

	const params = new URLSearchParams(window.location.search);
	const themeParam = params.get('theme');

	// Validate theme parameter against known themes
	const validThemes = [
		'february',
		'april',
		'july',
		'september',
		'october',
		'november',
		'december',
		'birthday',
	];

	if (themeParam && validThemes.includes(themeParam)) {
		return themeParam;
	}

	return null;
}
