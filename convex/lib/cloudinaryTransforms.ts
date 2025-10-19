// Helper utilities to compose Cloudinary transformation arrays for social share images
// This module is framework-agnostic and does not depend on Convex runtime APIs.

export const SOCIAL_PRESETS = {
  instagramSquare: { width: 1080, height: 1080, aspectRatio: "1:1" },
  instagramPortrait: { width: 1080, height: 1350, aspectRatio: "4:5" },
  twitterPost: { width: 1200, height: 675, aspectRatio: "16:9" },
  twitterHeader: { width: 1500, height: 500, aspectRatio: "3:1" },
  facebookCover: { width: 820, height: 312, aspectRatio: "205:78" },
} as const;

export type SocialPreset = keyof typeof SOCIAL_PRESETS;

export interface BuildOptions {
  // Choose one of the following ways to provide dimensions:
  // - preset: pick from known social presets
  // - width & height: explicit target size
  // - aspectRatio: compute from a baseWidth (defaults to 1080)
  preset?: SocialPreset;
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g. "4:5"
  baseWidth?: number; // used when aspectRatio is provided (default: 1080)

  // Features
  aiBackgroundFill?: boolean; // When true, use Cloudinary generative fill background

  // Output tuning
  format?: string; // e.g. "auto", "png", "webp"
  quality?: string; // e.g. "auto", "auto:best"
}

export interface BuiltTransforms {
  width: number;
  height: number;
  aspectRatio: string;
  // Cloudinary transformation steps
  preview: Array<Record<string, unknown>>;
  export: Array<Record<string, unknown>>;
}

function parseAspectRatio(input: string): [number, number] {
  const m = input.trim().match(/^(\d+)\s*:\s*(\d+)$/);
  if (!m) throw new Error(`Invalid aspect ratio: "${input}". Expected "W:H" (e.g. 4:5).`);
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    throw new Error(`Invalid aspect ratio numbers in "${input}". Width and height must be positive integers.`);
  }
  return [w, h];
}

function computeDimensions(opts: BuildOptions): { width: number; height: number; aspectRatio: string } {
  if (opts.preset) {
    const preset = SOCIAL_PRESETS[opts.preset];
    if (!preset) throw new Error(`Unknown preset: ${opts.preset}`);
    return { width: preset.width, height: preset.height, aspectRatio: preset.aspectRatio };
  }

  if (typeof opts.width === "number" && typeof opts.height === "number") {
    const { width, height } = opts;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error("Width and height must be positive numbers.");
    }
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(Math.round(width), Math.round(height));
    const ar = `${Math.round(width) / g}:${Math.round(height) / g}`;
    return { width, height, aspectRatio: ar };
  }

  if (opts.aspectRatio) {
    const [rw, rh] = parseAspectRatio(opts.aspectRatio);
    const baseWidth = opts.baseWidth ?? 1080;
    if (!Number.isFinite(baseWidth) || baseWidth <= 0) {
      throw new Error("baseWidth must be a positive number when using aspectRatio.");
    }
    const width = Math.round(baseWidth);
    const height = Math.round((baseWidth * rh) / rw);
    return { width, height, aspectRatio: `${rw}:${rh}` };
  }

  throw new Error("Provide either a preset, width & height, or an aspectRatio.");
}

export function buildSocialShareTransforms(options: BuildOptions): BuiltTransforms {
  const opts = {
    aiBackgroundFill: false,
    format: "auto",
    quality: "auto",
    ...options,
  } satisfies BuildOptions;

  const { width, height, aspectRatio } = computeDimensions(opts);

  // Guards for invalid feature combos
  if (opts.aiBackgroundFill && (width < 10 || height < 10)) {
    throw new Error("AI background fill is not supported for very small dimensions (<10px).");
  }

  // Primary step: maintain target size using pad (c_pad) for consistency.
  // If AI fill is enabled, use generative background; otherwise fall back to predominant color.
  const baseStep: Record<string, unknown> = {
    width,
    height,
    crop: "pad",
    gravity: "auto",
    background: opts.aiBackgroundFill ? "gen_fill" : "auto:predominant",
  };

  // Preview focuses on speed and automatic format/quality
  const preview: Array<Record<string, unknown>> = [
    baseStep,
    { fetch_format: opts.format ?? "auto", quality: opts.quality ?? "auto" },
  ];

  // Export is tuned for higher quality by default, with explicit PNG unless caller overrides
  const exportFmt = options.format ?? "png"; // default to PNG for export
  const exportQuality = options.quality ?? "auto:best";
  const exportSteps: Array<Record<string, unknown>> = [
    baseStep,
    { fetch_format: exportFmt, quality: exportQuality },
  ];

  return { width, height, aspectRatio, preview, export: exportSteps };
}
