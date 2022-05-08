import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';


export default function RegistrationSuccess() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CssBaseline />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Typography variant="h2" component="h1" color='green' gutterBottom>
          Almost there!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {'As a verification method, we sent to you an email with a proper link\
            that it will activate the account'}
        </Typography>
        <Typography variant="body1">
            Once done this, you can
            <Link href='/SignIn' underline='none'> Sign In </Link>
            to the site.
        </Typography>
      </Container>
    </Box>
  );
}
