import { getTileArtworkSource, tileArtworkIds } from '../tile-artwork';
import { getTileMotif } from '../motif-catalog';

describe('v0.3.0 tile artwork registry', () => {
  it.each(['bamboo', 'crane', 'gate', 'leaf', 'lotus', 'moon', 'mountain', 'sun', 'water'])(
    'uses approved bitmap artwork for the gameplay identity %s',
    (id) => {
      const motif = getTileMotif(id);
      expect(motif.artworkId).toBeDefined();
      expect(getTileArtworkSource(motif.artworkId ?? '')).toBeDefined();
    },
  );
  it('registers all 50 exported motifs by semantic ID', () => {
    expect(tileArtworkIds).toHaveLength(50);
    expect(new Set(tileArtworkIds)).toHaveProperty('size', 50);
    expect(getTileArtworkSource('01-bamboo')).toBeDefined();
    expect(getTileArtworkSource('missing')).toBeUndefined();
  });

  it('keeps the two squirrel illustrations as distinct artwork', () => {
    expect(getTileArtworkSource('42-squirrel-branch')).toBeDefined();
    expect(getTileArtworkSource('49-squirrel-log')).toBeDefined();
    expect(getTileArtworkSource('42-squirrel-branch')).not.toEqual(
      getTileArtworkSource('49-squirrel-log'),
    );
  });
});
