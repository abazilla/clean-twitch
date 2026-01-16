/**
 * Statistical utility functions for benchmark analysis
 * Uses simple-statistics for basic stats and @stdlib/stats-wilcoxon for hypothesis testing
 */

import { median as ssMedian, sampleStandardDeviation } from "simple-statistics"
import wilcoxon from "@stdlib/stats-wilcoxon"

/**
 * Calculate median of array (re-exported from simple-statistics)
 * @param {number[]} values
 * @returns {number}
 */
export function median(values) {
	if (values.length === 0) return 0
	return ssMedian(values)
}

/**
 * Calculate sample standard deviation (re-exported from simple-statistics)
 * @param {number[]} values
 * @returns {number}
 */
export function stdDev(values) {
	if (values.length === 0) return 0
	if (values.length === 1) return 0
	return sampleStandardDeviation(values)
}

/**
 * Wilcoxon signed-rank test for paired samples
 * Wrapper around @stdlib/stats-wilcoxon
 * @param {number[]} sample1
 * @param {number[]} sample2
 * @returns {{statistic: number, pValue: number, significant: boolean, sampleSize: number}}
 */
export function wilcoxonSignedRank(sample1, sample2) {
	const n = Math.min(sample1.length, sample2.length)

	if (n < 3) {
		return { statistic: 0, pValue: 1, significant: false, sampleSize: n }
	}

	try {
		const result = wilcoxon(sample1.slice(0, n), sample2.slice(0, n), {
			alpha: 0.05,
			alternative: "two-sided",
		})

		return {
			statistic: result.statistic,
			pValue: result.pValue,
			significant: result.rejected,
			sampleSize: n,
		}
	} catch {
		// Handle edge cases (all differences zero, etc.)
		return { statistic: 0, pValue: 1, significant: false, sampleSize: n }
	}
}

/**
 * Cliff's delta - non-parametric effect size measure
 * Interpretation:
 *   |d| < 0.147 = negligible
 *   |d| < 0.33  = small
 *   |d| < 0.474 = medium
 *   |d| >= 0.474 = large
 * @param {number[]} sample1
 * @param {number[]} sample2
 * @returns {{d: string, interpretation: string}}
 */
export function cliffsD(sample1, sample2) {
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
 * Helper to extract numeric value from stats (handles both single run numbers and aggregate objects)
 * @param {number|{mean?: number, median?: number}} value
 * @returns {number}
 */
export function getStatValue(value) {
	if (typeof value === "number") return value
	if (typeof value === "object" && value !== null) {
		// Prefer mean for aggregate stats
		return value.mean ?? value.median ?? 0
	}
	return 0
}

/**
 * Aggregate statistics from multiple benchmark runs
 * @param {Object[]} allRuns - Array of benchmark run results
 * @returns {Object} Aggregated statistics
 */
export function aggregateRuns(allRuns) {
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
