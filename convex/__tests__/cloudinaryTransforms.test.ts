import { describe, it, expect } from 'vitest';
import { buildSocialShareTransforms } from '../lib/cloudinaryTransforms';

describe('cloudinaryTransforms builder', () => {
  it('builds preset transformation for instagramSquare', () => {
    const result = buildSocialShareTransforms({ preset: 'instagramSquare' });
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1080);
    expect(result.aspectRatio).toBe('1:1');

    // First step should pad with predominant color by default
    const first = result.preview[0] as Record<string, unknown>;
    expect(first).toMatchObject({
      width: 1080,
      height: 1080,
      crop: 'pad',
      gravity: 'auto',
      background: 'auto:predominant',
    });

    // Second step should be auto format/quality
    const second = result.preview[1] as Record<string, unknown>;
    expect(second).toMatchObject({ fetch_format: 'auto', quality: 'auto' });
  });

  it('builds custom ratio transformation (4:5) with default baseWidth=1080', () => {
    const result = buildSocialShareTransforms({ aspectRatio: '4:5' });
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1350);
    expect(result.aspectRatio).toBe('4:5');

    const first = result.export[0] as Record<string, unknown>;
    expect(first).toMatchObject({
      width: 1080,
      height: 1350,
      crop: 'pad',
      gravity: 'auto',
      background: 'auto:predominant',
    });

    const second = result.export[1] as Record<string, unknown>;
    expect(second.fetch_format).toBe('png');
    expect(second.quality).toBe('auto:best');
  });

  it('builds AI-enabled transformation using generative fill background', () => {
    const result = buildSocialShareTransforms({ preset: 'twitterPost', aiBackgroundFill: true });
    expect(result.width).toBe(1200);
    expect(result.height).toBe(675);
    expect(result.aspectRatio).toBe('16:9');

    const first = result.preview[0] as Record<string, unknown>;
    expect(first.background).toBe('gen_fill');
    expect(first.crop).toBe('pad');
  });

  it('throws on invalid ratio', () => {
    expect(() => buildSocialShareTransforms({ aspectRatio: 'abc' })).toThrow(/Invalid aspect ratio/);
  });
});
