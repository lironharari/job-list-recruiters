import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Search from '../components/Search';

export default function Home() {
  const theme = useTheme();
  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom color="primary">
          Israel’s leading companies are looking for you!
        </Typography>
        <Typography variant="h5" component="h2" color={theme.palette.text.secondary} gutterBottom>
          Thousands of jobs are waiting just for you.
        </Typography>
      </Box>
      <Search />
    </Container>
  );
}
