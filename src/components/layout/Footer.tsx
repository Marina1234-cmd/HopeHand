import React from 'react'
import { Box, Container, Typography, Link, Stack } from '@mui/material'

// Add Material Icons font to the document head
const iconFont = document.createElement('link')
iconFont.rel = 'stylesheet'
iconFont.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
document.head.appendChild(iconFont)

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800]
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="text.primary" gutterBottom>
              HopeHand
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <span className="material-icons">facebook</span>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <span className="material-icons">twitter</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <span className="material-icons">photo_camera</span>
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <span className="material-icons">work</span>
              </Link>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={3}>
              <Link href="/about" color="inherit" underline="hover">
                About
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
              <Link href="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Terms of Service
              </Link>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} HopeHand. All rights reserved.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer 