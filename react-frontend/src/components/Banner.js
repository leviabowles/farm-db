import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '300px',
  width: '100%',
  // Using a placeholder since we don't have the actual file yet, 
  // but it points to the path where you should put your wheat picture.
  backgroundImage: `url('/assets/wheat-banner.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '0 0 24px 24px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Gradient overlay to make the white text pop and look modern
    background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
  },
}));

const ContentWrapper = styled(Container)({
  position: 'relative',
  zIndex: 1,
  color: '#ffffff',
  textAlign: 'left',
});

const Banner = () => {
  return (
    <BannerContainer>
      <ContentWrapper maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          Farm Database
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '600px' }}>
          Precision tracking for fields, crops, and transactions. 
          Manage your legacy and your future in one place.
        </Typography>
      </ContentWrapper>
    </BannerContainer>
  );
};

export default Banner;
