import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

// Helper functions for image handling
export const getImageUrl = (image, size = 'original') => {
  if (!image?.url) return null;

  // If it's already a full Cloudinary URL, return as is
  if (image.url.includes('res.cloudinary.com')) {
    // You can add transformations here if needed
    // For example: return image.url.replace('/upload/', `/upload/w_${size === 'thumbnail' ? 300 : 1000}/`);
    return image.url;
  }

  return image.url;
};

export const getPrimaryImage = (artwork) => {
  const primaryImg = artwork?.images?.find(img => img.isPrimary) || artwork?.images?.[0];
  return primaryImg?.url || null;
};

export const getAllImages = (artwork) => {
  return artwork?.images || [];
};

// Cloudinary specific helpers
export const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformations = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);

  const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  return `${baseUrl}/${transformationString}${publicId}`;
};

export default api;
