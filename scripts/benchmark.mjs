#!/usr/bin/env node
/**
 * Performance Benchmark Script for Clean Twitch Extension
 *
 * Measures memory usage, Core Web Vitals, and network metrics over time.
 * Uses Puppeteer + Chrome DevTools Protocol (CDP) for metrics.
 *
 * Default mode is 4-way comparison (--compare-all) which tests:
 *   - Extension (simple mode, minimalist preset) + chat visible
 *   - Extension (simple mode, minimalist preset) + chat collapsed
 *   - No extension + chat visible
 *   - No extension + chat collapsed
 */

import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"
import { fileURLToPath } from "url"
import {
	median,
	stdDev,
	wilcoxonSignedRank,
	cliffsD,
	getStatValue,
	aggregateRuns,
} from "./benchmark-utils.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXTENSION_PATH = path.resolve(__dirname, "../.output/chrome-mv3")
const OUTPUT_DIR = path.resolve(__dirname, "../.output")

// Capture log output for saving to file
const logBuffer = []

// Default config
const config = {
	// Benchmark mode: "compare-all" | "compare" | "single" | "websocket"
	mode: "compare-all", // Default to 4-way comparison
	withExtension: true,
	duration: 60, // seconds
	interval: 2000, // ms
	stream: "https://www.twitch.tv/directory", // Default to directory (always live)
	features: [], // Additional features to enable (for advanced mode)
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
			config.mode = "compare"
			break
		case "--compare-all":
			config.mode = "compare-all"
			break
		case "--single":
			config.mode = "single"
			break
		case "--websocket-only":
		case "--ws":
			config.mode = "websocket"
			break
		case "--quick":
			config.runs = 3
			config.duration = 30
			break
		case "--thorough":
			config.runs = 20
			config.duration = 120
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

Benchmark Modes (default: --compare-all):
  (no flag)             4-way comparison (default): ext+chat, ext+nochat, noext+chat, noext+nochat
                        Extension runs use simple mode with minimalist preset
  --compare             2-way comparison: with extension vs without
  --single              Single run with current settings
  --websocket-only, --ws  Test only WebSocket features (advanced mode, WS features only)

Speed Presets:
  --quick               Fast testing: 3 runs, 30s each
  (default)             Standard: 10 runs, 60s each
  --thorough            Comprehensive: 20 runs, 120s each

Options:
  --with-extension      Run with extension enabled (for --single mode)
  --without-extension   Run without extension (for --single mode)
  --duration <seconds>  Override duration per run (default: 60)
  --interval <ms>       Sampling interval (default: 2000)
  --stream <url>        Twitch stream URL to test
  --features <list>     Comma-separated list of feature IDs to enable (advanced mode)
  --json                Output results as JSON for pipeline integration
  --runs <n>            Override number of runs (default: 10)

Statistical Analysis:
  When using --compare or --compare-all with multiple runs, results include:
  - Wilcoxon signed-rank test (p < 0.05 = statistically significant)
  - Cliff's delta effect size (negligible/small/medium/large)

Examples:
  # Default 4-way comparison (full)
  node scripts/benchmark.mjs --stream https://www.twitch.tv/squeex

  # Quick 4-way test for development
  node scripts/benchmark.mjs --quick --stream https://www.twitch.tv/squeex

  # WebSocket-only test
  node scripts/benchmark.mjs --ws --quick --stream https://www.twitch.tv/squeex

  # JSON output for analysis
  node scripts/benchmark.mjs --quick --json | jq '.comparisons'

  # Thorough benchmark for final results
  node scripts/benchmark.mjs --thorough --stream https://www.twitch.tv/squeex --json
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
 * Log message (respects JSON mode, captures to buffer)
 */
function log(message) {
	logBuffer.push(message)
	if (!config.json) {
		console.log(message)
	}
}

/**
 * Log warning (respects JSON mode, captures to buffer)
 */
function warn(message) {
	logBuffer.push(`[WARN] ${message}`)
	if (!config.json) {
		console.warn(message)
	}
}

/**
 * Save benchmark results to JSON file in .output/
 */
function saveResults(results) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
	const filename = `benchmark-${config.mode}-${timestamp}.json`
	const filepath = path.join(OUTPUT_DIR, filename)

	const output = {
		...results,
		log: logBuffer,
		timestamp: new Date().toISOString(),
	}

	fs.writeFileSync(filepath, JSON.stringify(output, null, 2))
	console.log(`\nResults saved to: ${filepath}`)
	return filepath
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
 * @param {Object} options - Configuration options
 * @param {string[]} options.features - Features to enable (for advanced mode)
 * @param {boolean} options.useSimpleMode - Use simple mode (default: false)
 * @param {string} options.preset - Simple mode preset: "show_all" | "no_monetization" | "minimalist" | "focus"
 */
async function configureExtensionFeatures(page, extensionId, options = {}) {
	if (!extensionId) return

	const { features = [], useSimpleMode = false, preset = null } = options

	// Navigate to extension page to access chrome.storage
	const extensionPage = `chrome-extension://${extensionId}/popup.html`

	// Create a new page to configure storage
	const browser = page.browser()
	const configPage = await browser.newPage()

	try {
		await configPage.goto(extensionPage, { waitUntil: "domcontentloaded", timeout: 10000 })

		// Set features in storage
		await configPage.evaluate(
			(featureList, simpleMode, presetValue) => {
				const storage = { is_simple_mode: simpleMode }

				// Set preset if in simple mode
				if (simpleMode && presetValue) {
					storage.simple_mode_preset = presetValue
				}

				// Enable individual features (for advanced mode or additional features)
				for (const feature of featureList) {
					storage[feature] = true
				}

				return chrome.storage.local.set(storage)
			},
			features,
			useSimpleMode,
			preset
		)

		const modeLabel = useSimpleMode ? `simple (${preset || "default"})` : "advanced"
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
 * LCP waits until stable (no new entries for 2s) or max 10s timeout
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

			let lcpStabilityTimer = null
			let lcpObserver = null
			const LCP_STABILITY_DELAY = 2000 // Consider LCP stable after 2s of no updates
			const LCP_MAX_WAIT = 10000 // Max 10s wait for LCP

			const finalize = () => {
				if (lcpObserver) {
					lcpObserver.disconnect()
				}
				if (lcpStabilityTimer) {
					clearTimeout(lcpStabilityTimer)
				}
				resolve(vitals)
			}

			// LCP - wait for stability (no new entries for 2s) or max timeout
			try {
				lcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries()
					if (entries.length > 0) {
						const lastEntry = entries[entries.length - 1]
						vitals.LCP = lastEntry.renderTime || lastEntry.loadTime

						// Reset stability timer on each new LCP entry
						if (lcpStabilityTimer) {
							clearTimeout(lcpStabilityTimer)
						}
						lcpStabilityTimer = setTimeout(finalize, LCP_STABILITY_DELAY)
					}
				})
				lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
			} catch (e) {}

			// CLS
			try {
				new PerformanceObserver((list) => {
					list.getEntries().forEach((entry) => {
						if (!entry.hadRecentInput) {
							vitals.CLS += entry.value
						}
					})
				}).observe({ type: "layout-shift", buffered: true })
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

			// Max wait timeout - finalize even if LCP hasn't stabilized
			setTimeout(finalize, LCP_MAX_WAIT)

			// If no LCP observer or it fails, still resolve after short delay
			if (!lcpObserver) {
				setTimeout(finalize, 1000)
			}
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
 * @param {string} options.preset - Simple mode preset: "show_all" | "no_monetization" | "minimalist" | "focus"
 * @param {string[]} options.features - Features to enable (overrides config.features)
 */
async function runBenchmark(withExtension, runNumber = 1, options = {}) {
	const { chatCollapsed = false, useSimpleMode = false, preset = null, features = null } = options

	// Determine which features to enable
	const featuresToEnable = features !== null ? [...features] : [...config.features]

	// Build label
	let label = withExtension ? "WITH extension" : "WITHOUT extension"
	if (withExtension) {
		const modeLabel = useSimpleMode ? `simple:${preset || "default"}` : "advanced"
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
			await configureExtensionFeatures(page, extensionId, {
				features: featuresToEnable,
				useSimpleMode,
				preset,
			})
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

	// Extract numeric values (handles both single runs and aggregated stats)
	const sample1Avg = getStatValue(sample1Stats.heapUsed.avg)
	const sample2Avg = getStatValue(sample2Stats.heapUsed.avg)
	const sample1Growth = getStatValue(sample1Stats.heapUsed.growth)
	const sample2Growth = getStatValue(sample2Stats.heapUsed.growth)

	const heapDiff = sample1Avg - sample2Avg
	const growthDiff = sample1Growth - sample2Growth

	log("\nAverage Heap Usage:")
	log(`  ${label2}: ${sample2Avg.toFixed(2)} MB`)
	log(`  ${label1}: ${sample1Avg.toFixed(2)} MB`)
	log(`  Difference:        ${heapDiff >= 0 ? "+" : ""}${heapDiff.toFixed(2)} MB`)

	log("\nMemory Growth over test period:")
	log(`  ${label2}: ${sample2Growth >= 0 ? "+" : ""}${sample2Growth.toFixed(2)} MB`)
	log(`  ${label1}: ${sample1Growth >= 0 ? "+" : ""}${sample1Growth.toFixed(2)} MB`)
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
		log(`    W = ${wilcoxon.statistic}, p = ${wilcoxon.pValue.toFixed(4)}`)
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


// Main
async function main() {
	try {
		const results = {
			success: true,
			config: {
				mode: config.mode,
				duration: config.duration,
				interval: config.interval,
				stream: config.stream,
				features: config.features,
				runs: config.runs,
			},
		}

		// WebSocket features for websocket-only mode (advanced mode)
		const wsFeatures = ["auto_manage_chat_websocket", "block_hermes_websocket"]

		if (config.mode === "compare-all") {
			// 4-way comparison: ext+chat, ext+nochat, noext+chat, noext+nochat
			// Extension runs use simple mode with minimalist preset
			log("\nRunning 4-way comparison benchmark...\n")
			log("Scenarios:")
			log("  A: Extension (simple mode, minimalist preset) + chat visible")
			log("  B: Extension (simple mode, minimalist preset) + chat collapsed")
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
					runBenchmark(true, i + 1, {
						chatCollapsed: false,
						useSimpleMode: true,
						preset: "minimalist",
					}),
					runBenchmark(true, i + 1, {
						chatCollapsed: true,
						useSimpleMode: true,
						preset: "minimalist",
					}),
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
					scenarios.extChat.statistics,
					scenarios.noextChat.statistics,
					scenarios.extChat.runs,
					scenarios.noextChat.runs,
					"Ext + Chat",
					"No Ext + Chat"
				),
				extVsNoExt_chatClosed: compareResults(
					scenarios.extNochat.statistics,
					scenarios.noextNochat.statistics,
					scenarios.extNochat.runs,
					scenarios.noextNochat.runs,
					"Ext + No Chat",
					"No Ext + No Chat"
				),
				chatCollapseImpact_withExt: compareResults(
					scenarios.extNochat.statistics,
					scenarios.extChat.statistics,
					scenarios.extNochat.runs,
					scenarios.extChat.runs,
					"Ext + No Chat",
					"Ext + Chat"
				),
				chatCollapseImpact_noExt: compareResults(
					scenarios.noextNochat.statistics,
					scenarios.noextChat.statistics,
					scenarios.noextNochat.runs,
					scenarios.noextChat.runs,
					"No Ext + No Chat",
					"No Ext + Chat"
				),
			}

			// Always build results for saving
			results.scenarios = {}
			for (const [key, val] of Object.entries(scenarios)) {
				results.scenarios[key] = {
					runs: val.runs,
					statistics: val.statistics,
				}
			}
			results.comparisons = comparisons

			// Save to file and optionally output JSON
			saveResults(results)
			if (config.json) {
				outputJSON(results)
			}
		} else if (config.mode === "websocket") {
			// WebSocket-only mode: test only WebSocket features in advanced mode
			log("\nRunning WebSocket-only benchmark...\n")
			log("Testing WebSocket management features in isolation (advanced mode)")
			log("Features: auto_manage_chat_websocket, block_hermes_websocket")
			log("")
			log("Scenarios:")
			log("  A: Extension (WS features) + chat visible (WS active)")
			log("  B: Extension (WS features) + chat collapsed (WS closed by extension)")
			log("  C: No extension + chat visible (WS active)")
			log("  D: No extension + chat collapsed (WS still active)")
			log("")

			const scenarios = {
				extChat: { runs: [], label: "Ext + Chat (WS active)" },
				extNochat: { runs: [], label: "Ext + No Chat (WS closed)" },
				noextChat: { runs: [], label: "No Ext + Chat (WS active)" },
				noextNochat: { runs: [], label: "No Ext + No Chat (WS active)" },
			}

			for (let i = 0; i < config.runs; i++) {
				log(`\n${"=".repeat(60)}`)
				log(`RUN ${i + 1}/${config.runs}`)
				log(`${"=".repeat(60)}`)

				// Run all 4 scenarios in parallel for fair comparison
				const [extChat, extNochat, noextChat, noextNochat] = await Promise.all([
					runBenchmark(true, i + 1, {
						chatCollapsed: false,
						useSimpleMode: false, // Advanced mode
						features: wsFeatures,
					}),
					runBenchmark(true, i + 1, {
						chatCollapsed: true,
						useSimpleMode: false, // Advanced mode
						features: wsFeatures,
					}),
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
			log("WEBSOCKET-ONLY COMPARISON RESULTS")
			log("=".repeat(60))

			const comparisons = {
				wsImpact_extChatCollapse: compareResults(
					scenarios.extNochat.statistics,
					scenarios.extChat.statistics,
					scenarios.extNochat.runs,
					scenarios.extChat.runs,
					"Ext + No Chat (WS closed)",
					"Ext + Chat (WS active)"
				),
				wsImpact_noExtChatCollapse: compareResults(
					scenarios.noextNochat.statistics,
					scenarios.noextChat.statistics,
					scenarios.noextNochat.runs,
					scenarios.noextChat.runs,
					"No Ext + No Chat",
					"No Ext + Chat"
				),
				extVsNoExt_chatClosed: compareResults(
					scenarios.extNochat.statistics,
					scenarios.noextNochat.statistics,
					scenarios.extNochat.runs,
					scenarios.noextNochat.runs,
					"Ext + No Chat (WS closed)",
					"No Ext + No Chat (WS active)"
				),
			}

			// Always build results for saving
			results.scenarios = {}
			for (const [key, val] of Object.entries(scenarios)) {
				results.scenarios[key] = {
					runs: val.runs,
					statistics: val.statistics,
				}
			}
			results.comparisons = comparisons

			// Save to file and optionally output JSON
			saveResults(results)
			if (config.json) {
				outputJSON(results)
			}
		} else if (config.mode === "compare") {
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
				withExtStats,
				withoutExtStats,
				config.runs > 1 ? withExtRuns : null,
				config.runs > 1 ? withoutExtRuns : null,
				"With Extension",
				"Without Extension"
			)

			// Always build results for saving
			results.withExtension =
				config.runs === 1 ? withExtRuns[0] : { runs: withExtRuns, statistics: withExtStats }
			results.withoutExtension =
				config.runs === 1
					? withoutExtRuns[0]
					: { runs: withoutExtRuns, statistics: withoutExtStats }
			results.comparison = comparison

			// Save to file and optionally output JSON
			saveResults(results)
			if (config.json) {
				outputJSON(results)
			}
		} else {
			// Single mode runs (config.mode === "single")
			const allRuns = []
			for (let i = 0; i < config.runs; i++) {
				const stats = await runBenchmark(config.withExtension, i + 1)
				allRuns.push(stats)
			}

			if (config.runs > 1) {
				const statistics = aggregateRuns(allRuns)
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
				results.runs = allRuns
				results.statistics = statistics
			} else {
				results.stats = allRuns[0]
			}

			// Save to file and optionally output JSON
			saveResults(results)
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
