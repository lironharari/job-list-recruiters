import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
  { en: 'Frontend Engineer' },
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

const MagnifierIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#64748b'}}>
    <circle cx="11" cy="11" r="7" strokeWidth="2"/>
    <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#64748b'}}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-9a8 8 0 1 1 16 0c0 3.627-3.582 9-8 9z"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{color:'#64748b'}}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);

export default function Search(props: Props) {
  const { title: controlledTitle, setTitle: controlledSetTitle, location: controlledLocation, setLocation: controlledSetLocation, initialTitle, initialLocation } = props;

  const [innerTitle, setInnerTitle] = useState(initialTitle || '');
  const [innerLocation, setInnerLocation] = useState(initialLocation || '');
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const locRef = useRef<HTMLInputElement | null>(null);
  const titleWrapperRef = useRef<HTMLDivElement | null>(null);
  const locWrapperRef = useRef<HTMLDivElement | null>(null);

  const titleSuggestions = useMemo(() => filterSuggestions(JOB_SUGGESTIONS, innerTitle), [innerTitle]);
  const locationSuggestions = useMemo(() => filterSuggestions(ISRAEL_CITIES, innerLocation), [innerLocation]);
  const titleHasText = innerTitle.trim() !== '';
  const locationHasText = innerLocation.trim() !== '';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (titleWrapperRef.current && target && titleWrapperRef.current.contains(target)) return;
      if (locWrapperRef.current && target && locWrapperRef.current.contains(target)) return;
      setShowTitleSuggestions(false);
      setShowLocationSuggestions(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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
    // propagate to parent (if controlled) and navigate
    if (controlledSetTitle) controlledSetTitle(innerTitle);
    if (controlledSetLocation) controlledSetLocation(innerLocation);
    const params = new URLSearchParams();
    if (innerTitle.trim()) params.set('title', innerTitle.trim());
    if (innerLocation.trim()) params.set('location', innerLocation.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="search-container" style={{ width: '100%' }}>
      <div className="search-row">
        <div className="search-field" ref={titleWrapperRef} style={{position:'relative'}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><MagnifierIcon /></span>
          <input
            ref={titleRef}
            value={innerTitle}
            onChange={e => { setInnerTitle(e.target.value); setShowTitleSuggestions(true); }}
            onFocus={() => setShowTitleSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 120)}
            placeholder="Search your next job"
            className="input"
            style={{paddingLeft: '40px'}}
          />
          {innerTitle.trim() !== '' && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setInnerTitle(''); titleRef.current?.focus(); }}
              aria-label="Clear title"
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',padding:6,cursor:'pointer',color:'#64748b'}}
            >
              <ArrowIcon />
            </button>
          )}
          {showTitleSuggestions && titleSuggestions.length > 0 && titleHasText && (
            <ul className="suggestions">
              {titleSuggestions.map((s, i) => (
                <li
                  key={i}
                  onMouseDown={e => {
                        e.preventDefault();
                        setInnerTitle(s.en);
                        setShowTitleSuggestions(false);
                      }}
                >
                  {s.en}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* City input only */}
        <div className="search-field">
          <div            
            ref={locWrapperRef}
            style={{position:'relative'}}
          >
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><LocationIcon /></span>
            <input
              ref={locRef}
              value={innerLocation}
              onChange={e => { setInnerLocation(e.target.value); setShowLocationSuggestions(true); }}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 120)}
              placeholder="Where is your next job?"
              className="input"
              style={{ width: '100%', paddingLeft: '40px' }}
            />
            {innerLocation.trim() !== '' && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setInnerLocation(''); locRef.current?.focus(); }}
                aria-label="Clear location"
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',padding:6,cursor:'pointer',color:'#64748b'}}
              >
                <ArrowIcon />
              </button>
            )}
            {showLocationSuggestions && locationSuggestions.length > 0 && locationHasText && (
              <ul className="suggestions">
                {locationSuggestions.map((s, i) => (
                  <li
                    key={i}
                    onMouseDown={e => {
                        e.preventDefault();
                        setInnerLocation(s.en);
                        setShowLocationSuggestions(false);
                      }}
                    >
                      {s.en}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>

        <div className="search-action">
          <button type="button" className="btn" onClick={doSearch}>Search</button>
        </div>
      </div>
    </div>
  );
}
