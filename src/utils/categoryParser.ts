/**
 * Converts a category name to its URL-friendly version following Twitch's rules:
 * - Spaces to hyphens
 * - Remove apostrophes
 * - Lowercase
 * - Keep numbers
 * - Remove colons
 * - Remove periods (except in acronyms)
 * - Remove accents
 * - Convert & to "and"
 */
export function parseCategoryName(input: string): string {
	// Early return for empty input
	if (!input.trim()) return ""

	// First, normalize the string to decompose accented characters
	let result = input
		.normalize("NFD")
		// Remove accents/diacritics
		.replace(/[\u0300-\u036f]/g, "")
		// Convert & to "and"
		.replace(/&/g, "-and-")
		// Remove apostrophes
		.replace(/[']/g, "")
		// Remove colons
		.replace(/:/g, "")
		// Convert to lowercase
		.toLowerCase()

	// Handle acronyms vs regular periods
	// Split into words
	const words = result.split(" ")
	const processedWords = words.map((word) => {
		// Check if word is likely an acronym (all caps with periods)
		const isAcronym = /^([A-Z]\.)+[A-Z]?$/i.test(word)
		if (isAcronym) {
			// For acronyms, replace periods with hyphens
			return word.replace(/\./g, "-").replace(/-$/, "")
		}
		// For regular words, remove periods
		return word.replace(/\./g, "")
	})

	// Join words back together and replace spaces with hyphens
	result = processedWords.join(" ").replace(/\s+/g, "-")

	// Remove any remaining non-alphanumeric characters except hyphens
	result = result.replace(/[^a-z0-9-]/g, "")

	// Remove multiple consecutive hyphens
	result = result.replace(/-+/g, "-")

	// Remove leading and trailing hyphens
	result = result.replace(/^-+|-+$/g, "")

	return result
}
