// Avatar generation utility using DiceBear API
// This generates consistent avatars based on username

export const generateAvatarUrl = (username: string, style: 'adventurer' | 'avataaars' | 'big-ears' | 'bottts' | 'croodles' | 'fun-emoji' | 'micah' | 'miniavs' | 'personas' = 'personas'): string => {
  // Use username as seed for consistent avatar
  const seed = encodeURIComponent(username);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

export const generateAvatarProps = (username: string) => {
  const avatarUrl = generateAvatarUrl(username);
  return {
    src: avatarUrl,
    alt: `${username}'s avatar`,
  };
};

// Alternative: Generate initials-based avatar with random colors
export const generateInitialsAvatar = (username: string) => {
  const colors = [
    '#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2',
    '#303f9f', '#d32f2f', '#388e3c', '#f57c00', '#5d4037',
    '#455a64', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'
  ];
  
  // Use username to consistently pick a color
  const colorIndex = username.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return {
    children: username.charAt(0).toUpperCase(),
    sx: {
      backgroundColor,
      color: 'white',
      fontWeight: 'bold',
    }
  };
}; 