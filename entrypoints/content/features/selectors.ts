/**
 * Twitch DOM selector registry.
 *
 * Single source of truth for selector strings used by DOM manipulators
 * and blocker modules. When Twitch ships a DOM change, this is the file
 * to edit.
 *
 * Organized by Twitch UI region. Pure data: no DOM access, no imports
 * from other extension modules, no side effects.
 *
 * Fragility notes: selectors mentioning generated class names
 * (e.g. `ScTransitionBase-sc-hx4quq-0`, `cbxBks`, `kdDAY`) are highest
 * risk for breakage on Twitch deploys. They are tagged with FRAGILE in
 * a trailing comment.
 */

// ---------- TOP NAV ----------
export const TopNav = {
	CONTAINER: 'nav[data-a-target="top-nav-container"]',
	LOGIN_BUTTON: 'button[data-a-target="login-button"]',
	FOLLOWING_BUTTON: 'div.Layout-sc-1xcs6mc-0.fRzsnK:has(a[data-a-target="following-link"])', // FRAGILE: generated class
	ROBLOX_BUTTON: 'div.Layout-sc-1xcs6mc-0.fRzsnK:has(a[data-a-target="roblox-link"])', // FRAGILE
	BROWSE_BUTTON: 'div.Layout-sc-1xcs6mc-0.fRzsnK:has(a[data-a-target="browse-link"])', // FRAGILE
	DOTS_BUTTON: 'div.Layout-sc-1xcs6mc-0.jNQxNh:has(button[aria-label="More Options"])', // FRAGILE
	PRIME_GAMING_BUTTON: ".top-nav__prime",
	NOTIFICATIONS_BUTTON: ".Layout-sc-1xcs6mc-0.VxLcr:has(.onsite-notifications)", // FRAGILE
	WHISPERS_BUTTON: ".Layout-sc-1xcs6mc-0.VxLcr:has(button[data-a-target='whisper-box-button'])", // FRAGILE
	BITS_BUTTON: ".Layout-sc-1xcs6mc-0.VxLcr:has(button[data-a-target='top-nav-get-bits-button'])", // FRAGILE
	TURBO_BUTTON: '.Layout-sc-1xcs6mc-0.VxLcr:has(div[data-a-target="tw-core-button-label-text"])', // FRAGILE
} as const

// ---------- LEFT SIDEBAR ----------
export const LeftSidebar = {
	BAR: 'div[data-a-target="side-nav-bar"]',
	BAR_COLLAPSED: 'div[data-a-target="side-nav-bar-collapsed"]',
	COLLAPSE_BUTTON: 'button[aria-label="Collapse Side Nav"]',
	EXPAND_BUTTON: 'button[aria-label="Expand Side Nav"]',
	STORIES_SECTION: "div.storiesLeftNavSection--csO9S", // FRAGILE
	LIVE_STATUS_TOGGLE: "div[data-a-target='side-nav-live-status']",
	FOLLOWED_CHANNELS: "div[aria-label='Followed Channels']",
	LIVE_CHANNELS: "div[aria-label='Live Channels']",
	VIEWERS_ALSO_WATCH: "div[aria-label*='Viewers Also Watch']",
	RECOMMENDED_CATEGORIES: "div[aria-label='Recommended Categories']",
	SPONSORED_CARD: ".side-nav-card:has(.side-nav-card__link--promoted-followed)",
	GIFT_SUB_DISCOUNT: 'div.Layout-sc-1xcs6mc-0:has(> div[aria-label="Gift Sub"])', // FRAGILE
	HYPE_TRAIN: "div.Layout-sc-1xcs6mc-0:has(> div.hype-train-icon)", // FRAGILE
	OFFLINE_CHANNELS: 'div[class*="ScTransitionBase"]:has(.side-nav-card__avatar--offline)',
	SHOW_MORE_BUTTON: '[data-a-target="side-nav-show-more-button"]',
	SHOW_LESS_BUTTON: '[data-a-target="side-nav-show-less-button"]',
} as const

// ---------- RIGHT SIDEBAR / CHAT ----------
export const Chat = {
	BAR_EXPANDED: 'div[data-a-target="right-column-chat-bar"]',
	BAR_COLLAPSED: 'div[data-a-target="right-column-chat-bar-collapsed"]',
	COLLAPSE_BUTTON:
		'button[data-a-target="right-column__toggle-collapse-btn"][aria-label="Collapse Chat"]',
	EXPAND_BUTTON:
		'button[data-a-target="right-column__toggle-collapse-btn"][aria-label="Expand Chat"]',
	CHANNEL_RIGHT_COLUMN: ".channel-root__right-column",
	TOP_GIFTERS:
		'div.ScTransitionBase-sc-hx4quq-0.hhLPgp.tw-transition:has(button[aria-label="Expand Top Gifters Leaderboard"])', // FRAGILE: generated classes
	BITS_BUTTON: ".InjectLayout-sc-1i43xsx-0.iDMNUO:has(button[data-a-target='bits-button'])", // FRAGILE
	CHANNEL_POINTS_ICON: ".Layout-sc-1xcs6mc-0.eCNebZ:has(.channel-points-icon)", // FRAGILE
	BITS_BALANCE: 'div[data-test-selector="bits-balance-string"]',
	NEW_ITEM_INDICATOR: ".Layout-sc-1xcs6mc-0.gLwKGU:has(.ScNewItemIndicator-sc-1udtibe-0)", // FRAGILE
	COMMUNITY_HIGHLIGHT_STACK:
		".Layout-sc-1xcs6mc-0.cEllaX:has(div.community-highlight-stack__scroll-area--disable)", // FRAGILE
	BADGES: ".chat-line__username-container > span:first-child",
	BEST_MOMENTS_CLIP: 'div.cMeiZH:has(div[aria-label="Expand Top Clips Leaderboard"])', // FRAGILE
	PRIVATE_CALLOUT: 'div[data-test-selector="chat-private-callout-queue__callout-container"]',
	SUB_UPSELL: 'button:has(> div[style*="sub-upsell"])',
	SPONSOR_BANNER: "div:has(> button.channel-skins-banner__interactive)",
} as const

// ---------- PLAYER / CAROUSEL ----------
export const Player = {
	MINI: '.persistent-player[data-a-player-state="mini"]',
	MINI_BODY_HOME_SCOPED: 'body[data-ct-on-home="1"] .persistent-player[data-a-player-state="mini"]',
	MINI_VIDEO: '[data-a-player-type="site_mini"] video',
	FRONT_PAGE_CAROUSEL: '[data-a-target="front-page-carousel"]',
	FRONTPAGE_PLAYER: 'div[data-a-player-type="frontpage"]',
	FRONTPAGE_PLAYER_WITH_VIDEO: 'div[data-a-player-type="frontpage"]:has(video)',
	VIDEO_PLAYER: 'div[data-a-target="video-player"]',
	COMMON_CENTERED_COLUMN: "div.common-centered-column",
	RETURN_TO_STREAM_BUTTON: 'button[aria-label="Return to stream"]',
} as const

// ---------- DIRECTORY / THUMBNAILS ----------
export const Thumbnails = {
	VIEWERSHIP_LABEL: "p.kdDAY", // FRAGILE: generated class
	MEDIA_CARD_STAT: "div.tw-media-card-stat",
} as const

// ---------- CHANNEL VIDEO METADATA ----------
export const ChannelVideo = {
	GIFT_BUTTON_SECTION: 'div.theatre-social-panel:has(button[data-a-target="gift-button"])',
	BELOW_VIDEO_AD_WRAPPER: "div.stream-display-ad__wrapper",
	BELOW_VIDEO_AD_SECTION: 'div[aria-label="chan-sda-upsell-third-view"]',
	VIEWERSHIP_DIV: "div.cbxBks", // FRAGILE: generated class
	ANIMATED_VIEWERS_COUNT: 'strong[data-a-target="animated-channel-viewers-count"]',
	HYPE_TRAIN_OVERLAY:
		'div[aria-label="Chat Happening Now Overlay"]:has([class*="hypeTrainBanner"])', // FRAGILE: hashed class substring
} as const

// ---------- BELOW VIDEO INFO ----------
export const ChannelInfo = {
	ROOT: "div.channel-root__info",
	VIRAL_CLIP_SOCIAL_BANNER: "div[style*='social-sharing-badge-promo-banner']",
	MONTHLY_RECAP: "div.Layout-sc-1xcs6mc-0.dHnDFr:has(div.ScCalloutMessage-sc-23utpo-0)", // FRAGILE
	MONETIZATION_BITS:
		".Layout-sc-1xcs6mc-0.gWaIYG:has(button[data-a-target='top-nav-get-bits-button'])", // FRAGILE
	MONETIZATION_GIFT: ".Layout-sc-1xcs6mc-0.kaAEut:has(button[data-a-target='gift-button'])", // FRAGILE
	MONETIZATION_CONTINUE_SUB: ".Layout-sc-1xcs6mc-0.kaAEut:has(button[aria-label='Continue Sub'])", // FRAGILE
	MONETIZATION_SUBSCRIBE: ".Layout-sc-1xcs6mc-0.PiZST:has(button[data-a-target='subscribe-button'])", // FRAGILE
	MONETIZATION_SUBSCRIBE_DROPDOWN:
		".Layout-sc-1xcs6mc-0.PiZST:has(button[data-a-target='subscribe-button__dropdown'])", // FRAGILE
	COMBO_BUTTON: "div.gEvECC:has(button[aria-label='Open Combos modal'])", // FRAGILE
	ABOUT_SECTION: ".Layout-sc-1xcs6mc-0.hisUmW:has(.channel-panels)", // FRAGILE
	CHANNEL_PANEL_SECTION:
		".Layout-sc-1xcs6mc-0.hisUmW > div:nth-child(2):has(.channel-panels)", // FRAGILE
	CHANNEL_PROMO_BANNER:
		'div:has(> div > [class*="tw-root--theme-light"] [style*="Channel_Promo_Banner"])', // FRAGILE
	GIFT_SUB_DISCOUNT_PROMO:
		'div.Layout-sc-1xcs6mc-0:has(> div > div > [aria-label="Gift sub discount promotion"])', // FRAGILE: depth-sensitive
	GIFT_EXPIRATION_CALLOUT:
		'div.Layout-sc-1xcs6mc-0:has(> div > div > div > [class*="giftExpirationCalloutCreatorLed"])', // FRAGILE: depth-sensitive + hashed class substring
} as const

// ---------- FOOTER ----------
export const Footer = {
	STICKY_ROOT: "#twilight-sticky-footer-root",
	ROBLOX_DISMISS_BUTTON: 'button[id*="robloxBannerDismiss"]',
} as const

// ---------- BLOCKER FACTORIES ----------
// Per-channel / per-category card selectors. Returned as arrays so callers
// can flatMap into a single CSS rule list.

export function blockedChannelSearchSelectors(username: string): string[] {
	return [
		`#search-tray__container a[href="/${username}"]`,
		`a[data-tray-item="true"][href="/${username}"]`,
		`a[data-a-target="search-result-live-channel"][href="/${username}"]`,
		`div[data-a-target="search-results-live-channel"]:has(a[href="/${username}"])`,
		`div.search-result-offline_channel--body:has(a[href="/${username}"]) .search-result`,
		`a[href="/${username}"][data-a-target="search-result-live-channel"] ~ .search-result`,
		`div[data-a-target="search-result-live-channel"]:has(a[href="/${username}"])`,
		`div[data-a-target="search-result-video"]:has(a[href*="/${username}/"])`,
	]
}

export function blockedChannelSidebarSelectors(username: string): string[] {
	return [`div.side-nav-card:has(a[href="/${username}"])`]
}

export function blockedChannelDirectorySelectors(username: string): string[] {
	return [
		`div[data-target="directory-first-item"]:has(a[href="/${username}"])`,
		`div[data-target=""]:has(a[href="/${username}"])`,
		`a[href="/${username}"][data-a-target="preview-card-image-link"] ~ div.shelf-card__impression-wrapper`,
		`a[data-a-target="preview-card-image-link"][href="/${username}"] ~ div[data-target="directory-game__card_container"]`,
		`a[href="/${username}"] ~ .recommended-channel`,
		`a[href="/${username}"][data-test-selector="recommended-channel"] ~ div.recommended-channel`,
		`div.tw-col:has(a[href="/${username}"])`,
		`div.tw-transition:has(> .shelf-card__impression-wrapper):has(a[href="/${username}"])`,
	]
}

export function blockedCategorySearchSelectors(category: string): string[] {
	return [
		`div[role="row"]:has(a[href="/directory/category/${category}"])`,
		`div[data-a-target="search-result-category"]:has(a[href="/directory/category/${category}"])`,
		`div[data-a-target="search-results-live-channel"]:has(a[href="/directory/category/${category}"])`,
		`#search-tray__container a[href="/directory/category/${category}"]`,
		`a[data-tray-item="true"][href="/directory/category/${category}"]`,
		`a[data-a-target="search-result-live-channel"][href="/directory/category/${category}"]`,
		`a[href*="/directory/category/${category}"] ~ .search-result`,
		`a[href*="/directory/category/${category}"] ~ .search-result-card`,
		`div.efCikq:has(.search-result-card__img-wrapper):has(a[href="/${category}"])`, // FRAGILE
		`div[data-a-target="search-result-live-channel"]:has(a[href="/directory/category/${category}"])`,
		`div[data-a-target="search-result-video"]:has(a[href="/directory/category/${category}"])`,
	]
}

export function blockedCategorySidebarSelectors(category: string, name: string): string[] {
	return [
		`div.side-nav-card:has(a[href*="/directory/category/${category}" i])`,
		`div.side-nav-card:has(p[title="${name}" i])`,
	]
}

export function blockedCategoryDirectorySelectors(category: string): string[] {
	return [
		`div[data-target="directory-first-item"]:has(a[href="/directory/category/${category}"])`,
		`div[data-target=""]:has(a[href="/directory/category/${category}"])`,
		`a[href*="/directory/category/${category}"] ~ div[data-target="directory-page__card-container"]`,
		`div.game-card:has(a[href="/directory/category/${category}"])`,
		`div[data-a-target="shelf-card"]:has(a[href="/directory/category/${category}"])`,
		`div > h2 > a[href*="${category}"] ~ div`,
		`div.tw-transition:has(> .shelf-card__impression-wrapper):has(a[href="/directory/category/${category}"])`,
		`div.vertical-selector__wrapper:has(a[href*="/directory/${category}"])`,
	]
}
