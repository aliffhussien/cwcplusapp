export const getMediaAssetUrl = (mediaId, mediaList, fallback = null) => {
    if (!mediaId || !Array.isArray(mediaList)) return fallback;
    const asset = mediaList.find(m => m.id === mediaId);
    if (!asset) return fallback;
    return asset.card_url || asset.thumb_url || asset.hero_url || asset.url || fallback;
};
