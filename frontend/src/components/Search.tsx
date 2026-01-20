
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';

const JOB_SUGGESTIONS: Array<{ en: string }> = [
  { en: 'Full Stack Developer' },
  { en: 'Data Scientist' },
  { en: 'DevOps Engineer' },
  { en: 'Product Manager' },
  { en: 'UX/UI Designer' },
  { en: 'Mobile Developer' },
  { en: 'QA Engineer' },
  { en: 'Systems Analyst' },
  { en: 'Network Administrator' },
  { en: 'Database Administrator' },
  { en: 'IT Support Specialist' },
  { en: 'Cybersecurity Analyst' },
  { en: 'Cloud Engineer' },
  { en: 'AI Engineer' },
  { en: 'Machine Learning Engineer' },
  { en: 'Business Analyst' },
  { en: 'Scrum Master' },
  { en: 'Technical Writer' },
  { en: 'Solutions Architect' },
  { en: 'Backend Engineer' },
  { en: 'Frontend Developer' },
  { en: 'Embedded Software Engineer' },
  { en: 'Platform Engineer' },
  { en: 'DevSecOps Engineer' },
  { en: 'Site Reliability Engineer' },
  { en: 'Data Engineer' },
  { en: 'Game Developer' },
  { en: 'Blockchain Developer' },
  { en: 'Computer Vision Engineer' },
];

const ISRAEL_CITIES: Array<{ en: string }> = [
  { en: 'Afula' },
  { en: 'Bat Yam' },
  { en: 'Beersheba' },
  { en: 'Eilat' },
  { en: 'Haifa' },
  { en: 'Herzliya' },
  { en: 'Holon' },
  { en: 'Jerusalem' },
  { en: 'Kfar Saba' },
  { en: 'Kiryat Ata' },
  { en: 'Modiin' },
  { en: 'Nazareth' },
  { en: 'Netanya' },
  { en: 'Petah Tikva' },
  { en: 'Raanana' },
  { en: 'Ramat Gan' },
  { en: 'Rishon LeZion' },
  { en: 'Tel Aviv' },
];

function filterSuggestions(list: Array<{ en: string }>, value: string) {
  const q = value.trim().toLowerCase();
  if (!q) return list.slice(0, 6);
  const matched = list.filter(item => item.en.toLowerCase().includes(q));
  // If nothing matches, fall back to showing the full list (helpful UX)
  return (matched.length ? matched : list).slice(0, 8);
}

type Props = {
  // controlled props (optional)
  title?: string;
  setTitle?: (v: string) => void;
  location?: string;
  setLocation?: (v: string) => void;
  // initial uncontrolled values
  initialTitle?: string;
  initialLocation?: string;
};



export default function Search(props: Props) {
  const { title: controlledTitle, setTitle: controlledSetTitle, location: controlledLocation, setLocation: controlledSetLocation, initialTitle, initialLocation } = props;
  const [innerTitle, setInnerTitle] = useState(initialTitle || '');
  const [innerLocation, setInnerLocation] = useState(initialLocation || '');
  const navigate = useNavigate();
  const titleOptions = useMemo(() => JOB_SUGGESTIONS.map(j => j.en), []);
  const locationOptions = useMemo(() => ISRAEL_CITIES.map(c => c.en), []);

  // keep uncontrolled initial values in sync if props change
  useEffect(() => {
    if (initialTitle !== undefined) setInnerTitle(initialTitle);
  }, [initialTitle]);
  useEffect(() => {
    if (initialLocation !== undefined) setInnerLocation(initialLocation);
  }, [initialLocation]);

  // sync local inputs when parent-controlled values change
  useEffect(() => {
    if (controlledTitle !== undefined) setInnerTitle(controlledTitle);
  }, [controlledTitle]);
  useEffect(() => {
    if (controlledLocation !== undefined) setInnerLocation(controlledLocation);
  }, [controlledLocation]);



  const doSearch = () => {
    if (controlledSetTitle) controlledSetTitle(innerTitle);
    if (controlledSetLocation) controlledSetLocation(innerLocation);
    const params = new URLSearchParams();
    if (innerTitle.trim()) params.set('title', innerTitle.trim());
    if (innerLocation.trim()) params.set('location', innerLocation.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={2} width="100%">
      <Autocomplete
        freeSolo
        options={titleOptions}
        value={innerTitle}
        onInputChange={(_, value) => setInnerTitle(value)}
        renderInput={(params) => (
          <TextField {...params} label="Search your next job" variant="outlined" fullWidth />
        )}
        sx={{ flex: 2, minWidth: 200 }}
      />
      <Autocomplete
        freeSolo
        options={locationOptions}
        value={innerLocation}
        onInputChange={(_, value) => setInnerLocation(value)}
        renderInput={(params) => (
          <TextField {...params} label="Where is your next job?" variant="outlined" fullWidth />
        )}
        sx={{ flex: 2, minWidth: 200 }}
      />
      <Button variant="contained" color="primary" onClick={doSearch} sx={{ height: 56, minWidth: 120 }}>
        Search
      </Button>
    </Box>
  );
}
