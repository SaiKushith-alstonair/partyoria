const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getHeroVideo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/hero-video/`);
    if (!response.ok) {
      throw new Error('Failed to fetch hero video');
    }
    const data = await response.json();
    return data.video_url;
  } catch (error) {
    console.warn('Failed to fetch hero video from API, using fallback:', error);
    return '/videos/party-hero.mp4';
  }
};