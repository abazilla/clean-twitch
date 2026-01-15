#!/usr/bin/env node
/**
 * Performance Benchmark Script for Clean Twitch Extension
 *
 * Measures memory usage, Core Web Vitals, and network metrics over time.
 * Uses Puppeteer + Chrome DevTools Protocol (CDP) for metrics.
 *
 * Usage:
 *   node scripts/benchmark.mjs [options]
 *
 * Options:
 *   --with-extension     Run with extension enabled (default)
 *   --without-extension  Run without extension (baseline)
 *   --duration <seconds> How long to monitor (default: 60)
 *   --interval <ms>      Sampling interval (default: 2000)
 *   --stream <url>       Twitch stream URL to test
 *   --compare            Run both with and without, then compare
 *   --features <list>    Comma-separated list of features to enable
 *   --json               Output results as JSON for pipeline integration
 *   --runs <n>           Run benchmark N times and report statistics (default: 1)
 */

import path from "path"
import puppeteer from "puppeteer"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXTENSION_PATH = path.resolve(__dirname, "../.output/chrome-mv3")

// Default config
const config = {
	withExtension: true,
	duration: 60, // seconds
	interval: 2000, // ms
	stream: "https://www.twitch.tv/directory", // Default to directory (always live)
	compare: false,
	compare4way: false, // 4-way comparison mode
	features: [], // Additional features to enable
	json: false, // JSON output mode
	runs: 10, // Number of runs for statistical analysis (academic minimum)
}

// Parse CLI args
const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
	switch (args[i]) {
		case "--with-extension":
			config.withExtension = true
			break
		case "--without-extension":
			config.withExtension = false
			break
		case "--duration":
			config.duration = parseInt(args[++i], 10)
			break
		case "--interval":
			config.interval = parseInt(args[++i], 10)
			break
		case "--stream":
			config.stream = args[++i]
			break
		case "--compare":
			config.compare = true
			break
		case "--compare-all":
			config.compare4way = true
			break
		case "--features":
			config.features = args[++i].split(",").map((f) => f.trim())
			break
		case "--json":
			config.json = true
			break
		case "--runs":
			config.runs = parseInt(args[++i], 10)
			break
		case "--help":
			console.log(`
Performance Benchmark for Clean Twitch Extension

Usage: node scripts/benchmark.mjs [options]

Options:
  --with-extension      Run with extension enabled (default)
  --without-extension   Run without extension (baseline)
  --duration <seconds>  How long to monitor (default: 60)
  --interval <ms>       Sampling interval (default: 2000)
  --stream <url>        Twitch stream URL to test
  --compare             Run both with and without, then compare
  --compare-all         Run 4-way comparison: ext+chat, ext+nochat, noext+chat, noext+nochat
                        Uses simple mode with WebSocket features enabled
  --features <list>     Comma-separated list of feature IDs to enable
  --json                Output results as JSON for pipeline integration
  --runs <n>            Run benchmark N times and report statistics (default: 10)

Statistical Analysis:
  When using --compare or --compare-all with multiple runs, results include:
  - Wilcoxon signed-rank test (p < 0.05 = statistically significant)
  - Cliff's delta effect size (negligible/small/medium/large)

Examples:
  node scripts/benchmark.mjs --stream https://www.twitch.tv/squeex --duration 120
  node scripts/benchmark.mjs --compare --duration 60 --json
  node scripts/benchmark.mjs --compare-all --duration 60 --json | jq '.comparisons'
  node scripts/benchmark.mjs --without-extension --runs 5
			`)
			process.exit(0)
	}
}

/**
 * Output JSON to stdout (skill pattern)
 */
function outputJSON(data) {
	console.log(JSON.stringify(data, null, 2))
}

/**
 * Output error as JSON to stderr (skill pattern)
 */
function outputError(error) {
	console.error(
		JSON.stringify(
			{
				success: false,
				error: error.message,
				stack: error.stack,
			},
			null,
			2
		)
	)
	process.exit(1)
}

/**
 * Log message (respects JSON mode)
 */
function log(message) {
	if (!config.json) {
		console.log(message)
	}
}

/**
 * Log warning (respects JSON mode)
 */
function warn(message) {
	if (!config.json) {
		console.warn(message)
	}
}

/**
 * Calculate median of array
 */
function median(values) {
	if (values.length === 0) return 0
	const sorted = [...values].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Calculate standard deviation
 */
function stdDev(values) {
	if (values.length === 0) return 0
	const avg = values.reduce((a, b) => a + b, 0) / values.length
	const squareDiffs = values.map((v) => Math.pow(v - avg, 2))
	return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length)
}

/**
 * Approximation of standard normal CDF
 * Used for p-value calculation in Wilcoxon test
 */
function normalCDF(z) {
	const a1 = 0.254829592,
		a2 = -0.284496736,
		a3 = 1.421413741
	const a4 = -1.453152027,
		a5 = 1.061405429,
		p = 0.3275911
	const sign = z < 0 ? -1 : 1
	z = Math.abs(z) / Math.sqrt(2)
	const t = 1.0 / (1.0 + p * z)
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)
	return 0.5 * (1.0 + sign * y)
}

/**
 * Wilcoxon signed-rank test for paired samples
 * Non-parametric test - doesn't assume normal distribution
 * Returns p-value approximation using normal distribution (valid for n >= 10)
 */
function wilcoxonSignedRank(sample1, sample2) {
	const n = Math.min(sample1.length, sample2.length)
	const differences = []

	for (let i = 0; i < n; i++) {
		const diff = sample1[i] - sample2[i]
		if (diff !== 0) {
			differences.push({ diff, absDiff: Math.abs(diff), sign: Math.sign(diff) })
		}
	}

	if (differences.length === 0) {
		return { W: 0, z: 0, pValue: 1, significant: false, sampleSize: n }
	}

	// Rank by absolute difference (handle ties by averaging ranks)
	differences.sort((a, b) => a.absDiff - b.absDiff)
	let i = 0
	while (i < differences.length) {
		let j = i
		while (j < differences.length && differences[j].absDiff === differences[i].absDiff) {
			j++
		}
		// Average rank for tied values
		const avgRank = (i + 1 + j) / 2
		for (let k = i; k < j; k++) {
			differences[k].rank = avgRank
		}
		i = j
	}

	// Sum of positive and negative ranks
	const W_plus = differences.filter((d) => d.sign > 0).reduce((sum, d) => sum + d.rank, 0)
	const W_minus = differences.filter((d) => d.sign < 0).reduce((sum, d) => sum + d.rank, 0)
	const W = Math.min(W_plus, W_minus)

	// Normal approximation for n >= 10
	const nDiff = differences.length
	const mean = (nDiff * (nDiff + 1)) / 4
	const variance = (nDiff * (nDiff + 1) * (2 * nDiff + 1)) / 24
	const z = (W - mean) / Math.sqrt(variance)

	// Two-tailed p-value from z-score
	const pValue = 2 * (1 - normalCDF(Math.abs(z)))

	return {
		W,
		z: z.toFixed(3),
		pValue: pValue.toFixed(4),
		significant: pValue < 0.05,
		sampleSize: n,
	}
}

/**
 * Cliff's delta - non-parametric effect size measure
 * Interpretation:
 *   |d| < 0.147 = negligible
 *   |d| < 0.33  = small
 *   |d| < 0.474 = medium
 *   |d| >= 0.474 = large
 */
function cliffsD(sample1, sample2) {
	let greater = 0,
		less = 0

	for (const x of sample1) {
		for (const y of sample2) {
			if (x > y) greater++
			else if (x < y) less++
		}
	}

	const d = (greater - less) / (sample1.length * sample2.length)
	const absD = Math.abs(d)

	let interpretation
	if (absD < 0.147) interpretation = "negligible"
	else if (absD < 0.33) interpretation = "small"
	else if (absD < 0.474) interpretation = "medium"
	else interpretation = "large"

	return { d: d.toFixed(3), interpretation }
}

/**
 * Get the extension ID from the loaded extension
 */
async function getExtensionId(browser) {
	const targets = await browser.targets()
	const extensionTarget = targets.find(
		(target) => target.type() === "service_worker" && target.url().includes("chrome-extension://")
	)
	if (!extensionTarget) return null
	const match = extensionTarget.url().match(/chrome-extension:\/\/([^/]+)/)
	return match ? match[1] : null
}

/**
 * Configure extension features via chrome.storage.local
 * @param {Object} page - Puppeteer page
 * @param {string} extensionId - Extension ID
 * @param {string[]} features - Features to enable
 * @param {boolean} useSimpleMode - Use simple mode (default: false for backward compat)
 */
async function configureExtensionFeatures(page, extensionId, features, useSimpleMode = false) {
	if (!extensionId) return

	// Navigate to extension page to access chrome.storage
	const extensionPage = `chrome-extension://${extensionId}/popup.html`

	// Create a new page to configure storage
	const browser = page.browser()
	const configPage = await browser.newPage()

	try {
		await configPage.goto(extensionPage, { waitUntil: "domcontentloaded", timeout: 10000 })

		// Set features in storage
		await configPage.evaluate(
			(featureList, simpleMode) => {
				const storage = { is_simple_mode: simpleMode }
				for (const feature of featureList) {
					storage[feature] = true
				}
				return chrome.storage.local.set(storage)
			},
			features,
			useSimpleMode
		)

		const modeLabel = useSimpleMode ? "simple" : "advanced"
		const featureLog = features.length > 0 ? features.join(", ") : "(none)"
		log(`Configured: mode=${modeLabel}, features: ${featureLog}`)
	} catch (err) {
		warn(`Could not configure extension features: ${err.message}`)
	} finally {
		await configPage.close()
	}
}

/**
 * Measure Core Web Vitals
 */
async function measureVitals(page) {
	return await page.evaluate(() => {
		return new Promise((resolve) => {
			const vitals = {
				LCP: null,
				FCP: null,
				CLS: 0,
				TTFB: null,
			}

			// LCP
			try {
				new PerformanceObserver((list) => {
					const entries = list.getEntries()
					if (entries.length > 0) {
						const lastEntry = entries[entries.length - 1]
						vitals.LCP = lastEntry.renderTime || lastEntry.loadTime
					}
				}).observe({ entryTypes: ["largest-contentful-paint"], buffered: true })
			} catch (e) {}

			// CLS
			try {
				new PerformanceObserver((list) => {
					list.getEntries().forEach((entry) => {
						if (!entry.hadRecentInput) {
							vitals.CLS += entry.value
						}
					})
				}).observe({ entryTypes: ["layout-shift"], buffered: true })
			} catch (e) {}

			// FCP
			try {
				const paintEntries = performance.getEntriesByType("paint")
				const fcpEntry = paintEntries.find((e) => e.name === "first-contentful-paint")
				if (fcpEntry) {
					vitals.FCP = fcpEntry.startTime
				}
			} catch (e) {}

			// TTFB
			try {
				const [navigationEntry] = performance.getEntriesByType("navigation")
				if (navigationEntry) {
					vitals.TTFB = navigationEntry.responseStart - navigationEntry.requestStart
				}
			} catch (e) {}

			// Wait a bit for metrics to stabilize
			setTimeout(() => resolve(vitals), 1000)
		})
	})
}

/**
 * Run a single benchmark session
 * @param {boolean} withExtension - Run with extension loaded
 * @param {number} runNumber - Current run number
 * @param {Object} options - Additional options
 * @param {boolean} options.chatCollapsed - Whether to collapse chat
 * @param {boolean} options.useSimpleMode - Use simple mode (true) or advanced mode (false)
 * @param {string[]} options.features - Features to enable (overrides config.features)
 */
async function runBenchmark(withExtension, runNumber = 1, options = {}) {
	const { chatCollapsed = false, useSimpleMode = false, features = null } = options

	// Determine which features to enable
	const featuresToEnable = features !== null ? [...features] : [...config.features]

	// Build label
	let label = withExtension ? "WITH extension" : "WITHOUT extension"
	if (withExtension) {
		const modeLabel = useSimpleMode ? "simple" : "advanced"
		label += ` (${modeLabel})`
		if (featuresToEnable.length > 0) {
			label += ` [${featuresToEnable.join(", ")}]`
		}
	}
	label += chatCollapsed ? " [chat collapsed]" : " [chat visible]"

	if (config.runs > 1) {
		log(`\n${"=".repeat(60)}`)
		log(`Run ${runNumber}/${config.runs}: ${label}`)
		log(`${"=".repeat(60)}\n`)
	} else {
		log(`\n${"=".repeat(60)}`)
		log(`Starting benchmark ${label}`)
		log(`Duration: ${config.duration}s, Interval: ${config.interval}ms`)
		log(`Stream: ${config.stream}`)
		log(`${"=".repeat(60)}\n`)
	}

	const launchArgs = [
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-background-timer-throttling",
		"--disable-backgrounding-occluded-windows",
		"--disable-renderer-backgrounding",
	]

	if (withExtension) {
		launchArgs.push(`--disable-extensions-except=${EXTENSION_PATH}`)
		launchArgs.push(`--load-extension=${EXTENSION_PATH}`)
	} else {
		launchArgs.push("--disable-extensions")
	}

	const browser = await puppeteer.launch({
		headless: false, // Extensions require headed mode
		args: launchArgs,
	})

	const page = await browser.newPage()

	// Track network requests
	const networkStats = {
		totalRequests: 0,
		totalBytes: 0,
		byType: {},
	}

	page.on("response", async (response) => {
		try {
			const type = response.request().resourceType()
			const headers = response.headers()
			const contentLength = parseInt(headers["content-length"] || "0", 10)

			networkStats.totalRequests++
			networkStats.totalBytes += contentLength
			networkStats.byType[type] = (networkStats.byType[type] || 0) + 1
		} catch (e) {
			// Ignore errors from failed responses
		}
	})

	// Configure extension with specified mode and features
	if (withExtension) {
		// Wait a moment for extension to load
		await new Promise((r) => setTimeout(r, 1000))
		const extensionId = await getExtensionId(browser)
		if (extensionId) {
			await configureExtensionFeatures(page, extensionId, featuresToEnable, useSimpleMode)
		} else {
			warn("Could not find extension ID - features may not be configured")
		}
	}

	// Set up CDP session for performance metrics
	const client = await page.target().createCDPSession()
	await client.send("Performance.enable")

	// Navigate to stream
	log("Navigating to stream...")
	await page.goto(config.stream, { waitUntil: "networkidle2", timeout: 60000 })
	log("Page loaded")

	// Measure Core Web Vitals after page load
	const vitals = await measureVitals(page)

	// Collapse chat if requested (for 4-way comparison or specific feature testing)
	if (chatCollapsed) {
		log("Collapsing chat column...")
		try {
			await page.waitForSelector('[data-a-target="right-column__toggle-collapse-btn"]', {
				timeout: 10000,
			})
			await page.click('[data-a-target="right-column__toggle-collapse-btn"]')
			await new Promise((r) => setTimeout(r, 500))
			log("Chat collapsed")
		} catch (err) {
			warn(`Could not collapse chat: ${err.message}`)
		}
	}

	log("Starting measurement...\n")

	// Collect metrics over time
	const samples = []
	const startTime = Date.now()
	const endTime = startTime + config.duration * 1000

	const metricsToTrack = ["JSHeapUsedSize", "JSHeapTotalSize", "Nodes", "JSEventListeners"]

	if (!config.json) {
		log("Time(s)  | Heap Used (MB) | Heap Total (MB) | DOM Nodes | Event Listeners")
		log("-".repeat(75))
	}

	while (Date.now() < endTime) {
		const elapsed = ((Date.now() - startTime) / 1000).toFixed(0).padStart(6)
		const result = await client.send("Performance.getMetrics")

		const metrics = {}
		for (const m of result.metrics) {
			if (metricsToTrack.includes(m.name)) {
				metrics[m.name] = m.value
			}
		}

		const heapUsed = (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)
		const heapTotal = (metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)
		const nodes = metrics.Nodes || 0
		const listeners = metrics.JSEventListeners || 0

		if (!config.json) {
			log(
				`${elapsed}s    | ${heapUsed.padStart(13)} | ${heapTotal.padStart(14)} | ${String(nodes).padStart(9)} | ${String(listeners).padStart(15)}`
			)
		}

		samples.push({
			timestamp: Date.now() - startTime,
			heapUsed: metrics.JSHeapUsedSize,
			heapTotal: metrics.JSHeapTotalSize,
			nodes: metrics.Nodes,
			listeners: metrics.JSEventListeners,
		})

		await new Promise((r) => setTimeout(r, config.interval))
	}

	await browser.close()

	// Calculate statistics
	const heapUsedValues = samples.map((s) => s.heapUsed)
	const stats = {
		label,
		withExtension,
		samples: samples.length,
		heapUsed: {
			min: Math.min(...heapUsedValues) / 1024 / 1024,
			max: Math.max(...heapUsedValues) / 1024 / 1024,
			avg: heapUsedValues.reduce((a, b) => a + b, 0) / heapUsedValues.length / 1024 / 1024,
			median: median(heapUsedValues) / 1024 / 1024,
			start: heapUsedValues[0] / 1024 / 1024,
			end: heapUsedValues[heapUsedValues.length - 1] / 1024 / 1024,
		},
		vitals,
		network: {
			totalRequests: networkStats.totalRequests,
			totalBytesMB: (networkStats.totalBytes / 1024 / 1024).toFixed(2),
			byType: networkStats.byType,
		},
	}

	stats.heapUsed.growth = stats.heapUsed.end - stats.heapUsed.start

	if (!config.json) {
		log(`\n${"=".repeat(60)}`)
		log(`Results ${label}:`)
		log(`${"=".repeat(60)}`)
		log(`Samples collected: ${stats.samples}`)
		log(`Heap Used:`)
		log(`  Start:  ${stats.heapUsed.start.toFixed(2)} MB`)
		log(`  End:    ${stats.heapUsed.end.toFixed(2)} MB`)
		log(`  Min:    ${stats.heapUsed.min.toFixed(2)} MB`)
		log(`  Max:    ${stats.heapUsed.max.toFixed(2)} MB`)
		log(`  Avg:    ${stats.heapUsed.avg.toFixed(2)} MB`)
		log(`  Median: ${stats.heapUsed.median.toFixed(2)} MB`)
		log(`  Growth: ${stats.heapUsed.growth >= 0 ? "+" : ""}${stats.heapUsed.growth.toFixed(2)} MB`)
		log(`\nCore Web Vitals:`)
		log(`  LCP:  ${vitals.LCP ? vitals.LCP.toFixed(2) + " ms" : "N/A"}`)
		log(`  FCP:  ${vitals.FCP ? vitals.FCP.toFixed(2) + " ms" : "N/A"}`)
		log(`  CLS:  ${vitals.CLS.toFixed(4)}`)
		log(`  TTFB: ${vitals.TTFB ? vitals.TTFB.toFixed(2) + " ms" : "N/A"}`)
		log(`\nNetwork:`)
		log(`  Total Requests: ${stats.network.totalRequests}`)
		log(`  Total Size:     ${stats.network.totalBytesMB} MB`)
	}

	return stats
}

/**
 * Compare two benchmark runs with optional statistical analysis
 * @param {Object} sample1Stats - Aggregated stats for sample 1
 * @param {Object} sample2Stats - Aggregated stats for sample 2
 * @param {Object[]} sample1Runs - All individual runs for sample 1 (for statistical tests)
 * @param {Object[]} sample2Runs - All individual runs for sample 2 (for statistical tests)
 * @param {string} label1 - Label for sample 1
 * @param {string} label2 - Label for sample 2
 */
function compareResults(sample1Stats, sample2Stats, sample1Runs = null, sample2Runs = null, label1 = "Sample 1", label2 = "Sample 2") {
	log(`\n${"=".repeat(60)}`)
	log(`COMPARISON: ${label1} vs ${label2}`)
	log(`${"=".repeat(60)}`)

	const heapDiff = sample1Stats.heapUsed.avg - sample2Stats.heapUsed.avg
	const growthDiff = sample1Stats.heapUsed.growth - sample2Stats.heapUsed.growth

	log("\nAverage Heap Usage:")
	log(`  ${label2}: ${sample2Stats.heapUsed.avg.toFixed(2)} MB`)
	log(`  ${label1}: ${sample1Stats.heapUsed.avg.toFixed(2)} MB`)
	log(`  Difference:        ${heapDiff >= 0 ? "+" : ""}${heapDiff.toFixed(2)} MB`)

	log("\nMemory Growth over test period:")
	log(`  ${label2}: ${sample2Stats.heapUsed.growth >= 0 ? "+" : ""}${sample2Stats.heapUsed.growth.toFixed(2)} MB`)
	log(`  ${label1}: ${sample1Stats.heapUsed.growth >= 0 ? "+" : ""}${sample1Stats.heapUsed.growth.toFixed(2)} MB`)
	log(`  Difference:        ${growthDiff >= 0 ? "+" : ""}${growthDiff.toFixed(2)} MB`)

	// Statistical analysis (only when we have multiple runs)
	let statistical = null
	if (sample1Runs && sample2Runs && sample1Runs.length >= 3 && sample2Runs.length >= 3) {
		const sample1Heaps = sample1Runs.map((r) => r.heapUsed.avg)
		const sample2Heaps = sample2Runs.map((r) => r.heapUsed.avg)

		const wilcoxon = wilcoxonSignedRank(sample1Heaps, sample2Heaps)
		const effectSize = cliffsD(sample2Heaps, sample1Heaps) // Order: baseline first for positive = improvement

		statistical = { wilcoxon, effectSize }

		log("\nStatistical Analysis:")
		log(`  Wilcoxon signed-rank test:`)
		log(`    W = ${wilcoxon.W}, z = ${wilcoxon.z}, p = ${wilcoxon.pValue}`)
		log(`    ${wilcoxon.significant ? "STATISTICALLY SIGNIFICANT (p < 0.05)" : "Not significant (p >= 0.05)"}`)
		log(`  Cliff's delta effect size:`)
		log(`    d = ${effectSize.d} (${effectSize.interpretation})`)
	}

	let verdict
	if (heapDiff < 0) {
		log("\nResult: Sample 1 uses LESS memory on average")
		verdict = "better"
	} else if (Math.abs(heapDiff) < 5) {
		log("\nResult: Memory difference is negligible (<5 MB)")
		verdict = "negligible"
	} else {
		log("\nResult: Sample 1 uses MORE memory")
		verdict = "worse"
	}

	return {
		heapDiff,
		growthDiff,
		verdict,
		statistical,
	}
}

/**
 * Aggregate statistics from multiple runs
 */
function aggregateRuns(allRuns) {
	const heapAvgs = allRuns.map((r) => r.heapUsed.avg)
	const heapGrowths = allRuns.map((r) => r.heapUsed.growth)
	const lcpValues = allRuns.map((r) => r.vitals.LCP).filter((v) => v !== null)
	const fcpValues = allRuns.map((r) => r.vitals.FCP).filter((v) => v !== null)
	const clsValues = allRuns.map((r) => r.vitals.CLS)
	const networkRequests = allRuns.map((r) => r.network.totalRequests)

	return {
		runs: allRuns.length,
		heapUsed: {
			avg: {
				mean: heapAvgs.reduce((a, b) => a + b, 0) / heapAvgs.length,
				median: median(heapAvgs),
				stdDev: stdDev(heapAvgs),
				min: Math.min(...heapAvgs),
				max: Math.max(...heapAvgs),
			},
			growth: {
				mean: heapGrowths.reduce((a, b) => a + b, 0) / heapGrowths.length,
				median: median(heapGrowths),
				stdDev: stdDev(heapGrowths),
			},
		},
		vitals: {
			LCP: lcpValues.length > 0 ? { median: median(lcpValues), stdDev: stdDev(lcpValues) } : null,
			FCP: fcpValues.length > 0 ? { median: median(fcpValues), stdDev: stdDev(fcpValues) } : null,
			CLS: { median: median(clsValues), stdDev: stdDev(clsValues) },
		},
		network: {
			requests: {
				mean: networkRequests.reduce((a, b) => a + b, 0) / networkRequests.length,
				median: median(networkRequests),
			},
		},
	}
}

// Main
async function main() {
	try {
		const results = {
			success: true,
			config: {
				duration: config.duration,
				interval: config.interval,
				stream: config.stream,
				features: config.features,
				runs: config.runs,
			},
		}

		// WebSocket features to enable for extension runs in 4-way comparison
		const wsFeatures = ["auto_manage_chat_websocket", "block_hermes_websocket"]

		if (config.compare4way) {
			// 4-way comparison: ext+chat, ext+nochat, noext+chat, noext+nochat
			log("\nRunning 4-way comparison benchmark...\n")
			log("Scenarios:")
			log("  A: Extension (simple mode) + chat visible")
			log("  B: Extension (simple mode) + chat collapsed")
			log("  C: No extension + chat visible")
			log("  D: No extension + chat collapsed")
			log("")

			const scenarios = {
				extChat: { runs: [], label: "Ext + Chat" },
				extNochat: { runs: [], label: "Ext + No Chat" },
				noextChat: { runs: [], label: "No Ext + Chat" },
				noextNochat: { runs: [], label: "No Ext + No Chat" },
			}

			for (let i = 0; i < config.runs; i++) {
				log(`\n${"=".repeat(60)}`)
				log(`RUN ${i + 1}/${config.runs}`)
				log(`${"=".repeat(60)}`)

				// Run all 4 scenarios in parallel for fair comparison
				const [extChat, extNochat, noextChat, noextNochat] = await Promise.all([
					runBenchmark(true, i + 1, { chatCollapsed: false, useSimpleMode: true, features: wsFeatures }),
					runBenchmark(true, i + 1, { chatCollapsed: true, useSimpleMode: true, features: wsFeatures }),
					runBenchmark(false, i + 1, { chatCollapsed: false }),
					runBenchmark(false, i + 1, { chatCollapsed: true }),
				])

				scenarios.extChat.runs.push(extChat)
				scenarios.extNochat.runs.push(extNochat)
				scenarios.noextChat.runs.push(noextChat)
				scenarios.noextNochat.runs.push(noextNochat)
			}

			// Aggregate statistics for each scenario
			for (const key of Object.keys(scenarios)) {
				scenarios[key].statistics = aggregateRuns(scenarios[key].runs)
			}

			// Generate comparison matrix
			log("\n" + "=".repeat(60))
			log("4-WAY COMPARISON RESULTS")
			log("=".repeat(60))

			const comparisons = {
				extVsNoExt_chatOpen: compareResults(
					scenarios.extChat.statistics.heapUsed.avg,
					scenarios.noextChat.statistics.heapUsed.avg,
					scenarios.extChat.runs,
					scenarios.noextChat.runs,
					"Ext + Chat",
					"No Ext + Chat"
				),
				extVsNoExt_chatClosed: compareResults(
					scenarios.extNochat.statistics.heapUsed.avg,
					scenarios.noextNochat.statistics.heapUsed.avg,
					scenarios.extNochat.runs,
					scenarios.noextNochat.runs,
					"Ext + No Chat",
					"No Ext + No Chat"
				),
				chatCollapseImpact_withExt: compareResults(
					scenarios.extNochat.statistics.heapUsed.avg,
					scenarios.extChat.statistics.heapUsed.avg,
					scenarios.extNochat.runs,
					scenarios.extChat.runs,
					"Ext + No Chat",
					"Ext + Chat"
				),
				chatCollapseImpact_noExt: compareResults(
					scenarios.noextNochat.statistics.heapUsed.avg,
					scenarios.noextChat.statistics.heapUsed.avg,
					scenarios.noextNochat.runs,
					scenarios.noextChat.runs,
					"No Ext + No Chat",
					"No Ext + Chat"
				),
			}

			if (config.json) {
				results.scenarios = {}
				for (const [key, val] of Object.entries(scenarios)) {
					results.scenarios[key] = {
						runs: val.runs,
						statistics: val.statistics,
					}
				}
				results.comparisons = comparisons
				outputJSON(results)
			}
		} else if (config.compare) {
			// Run benchmarks for both modes (original 2-way comparison)
			log("\nRunning benchmarks for comparison...\n")

			const withExtRuns = []
			const withoutExtRuns = []

			for (let i = 0; i < config.runs; i++) {
				// Run in parallel for fair comparison (same network conditions)
				const [withoutExtStats, withExtStats] = await Promise.all([
					runBenchmark(false, i + 1),
					runBenchmark(true, i + 1),
				])
				withExtRuns.push(withExtStats)
				withoutExtRuns.push(withoutExtStats)
			}

			// Get single run or aggregate stats
			const withExtStats = config.runs === 1 ? withExtRuns[0] : aggregateRuns(withExtRuns)
			const withoutExtStats = config.runs === 1 ? withoutExtRuns[0] : aggregateRuns(withoutExtRuns)

			// Use the new compareResults signature with statistical analysis
			const comparison = compareResults(
				config.runs === 1 ? withExtStats : { heapUsed: withExtStats.heapUsed.avg },
				config.runs === 1 ? withoutExtStats : { heapUsed: withoutExtStats.heapUsed.avg },
				config.runs > 1 ? withExtRuns : null,
				config.runs > 1 ? withoutExtRuns : null,
				"With Extension",
				"Without Extension"
			)

			if (config.json) {
				results.withExtension =
					config.runs === 1 ? withExtRuns[0] : { runs: withExtRuns, statistics: withExtStats }
				results.withoutExtension =
					config.runs === 1
						? withoutExtRuns[0]
						: { runs: withoutExtRuns, statistics: withoutExtStats }
				results.comparison = comparison
				outputJSON(results)
			}
		} else {
			// Single mode runs
			const allRuns = []
			for (let i = 0; i < config.runs; i++) {
				const stats = await runBenchmark(config.withExtension, i + 1)
				allRuns.push(stats)
			}

			if (config.runs > 1) {
				const statistics = aggregateRuns(allRuns)
				if (!config.json) {
					log(`\n${"=".repeat(60)}`)
					log(`AGGREGATE STATISTICS (${config.runs} runs)`)
					log(`${"=".repeat(60)}`)
					log(`\nHeap Used Average:`)
					log(`  Mean:   ${statistics.heapUsed.avg.mean.toFixed(2)} MB`)
					log(`  Median: ${statistics.heapUsed.avg.median.toFixed(2)} MB`)
					log(`  StdDev: ${statistics.heapUsed.avg.stdDev.toFixed(2)} MB`)
					log(
						`  Range:  ${statistics.heapUsed.avg.min.toFixed(2)} - ${statistics.heapUsed.avg.max.toFixed(2)} MB`
					)
					log(`\nHeap Growth:`)
					log(
						`  Median: ${statistics.heapUsed.growth.median >= 0 ? "+" : ""}${statistics.heapUsed.growth.median.toFixed(2)} MB`
					)
					log(`  StdDev: ${statistics.heapUsed.growth.stdDev.toFixed(2)} MB`)
					if (statistics.vitals.LCP) {
						log(`\nCore Web Vitals (median):`)
						log(`  LCP: ${statistics.vitals.LCP.median.toFixed(2)} ms`)
						log(`  FCP: ${statistics.vitals.FCP?.median.toFixed(2) || "N/A"} ms`)
						log(`  CLS: ${statistics.vitals.CLS.median.toFixed(4)}`)
					}
				}
				results.runs = allRuns
				results.statistics = statistics
			} else {
				results.stats = allRuns[0]
			}

			if (config.json) {
				outputJSON(results)
			}
		}
	} catch (err) {
		if (config.json) {
			outputError(err)
		} else {
			console.error("Benchmark error:", err)
			process.exit(1)
		}
	}
}

main()
