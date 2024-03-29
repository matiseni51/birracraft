import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";

export default function ActivationSuccess() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CssBaseline />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Typography variant="h2" component="h1" color="green" gutterBottom>
          Registration Completed!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your new account was activated. Now you can
          <Link href="/SignIn" underline="none">
            {" "}
            Sign In{" "}
          </Link>
          on the site.
        </Typography>
      </Container>
    </Box>
  );
}
