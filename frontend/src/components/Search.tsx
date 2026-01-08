import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const JOB_SUGGESTIONS: Array<{ en: string; he: string }> = [
  { en: 'Frontend Developer', he: 'מפתח פרונטאנד' },
  { en: 'Backend Developer', he: 'מפתח בקאנד' },
  { en: 'Fullstack Developer', he: 'מפתח פולסטאק' },
  { en: 'DevOps Engineer', he: 'מהנדס DevOps' },
  { en: 'Data Scientist', he: 'מדען נתונים' },
  { en: 'Mobile Developer', he: 'מפתח מובייל' },
  { en: 'Software Engineer', he: 'מהנדס תוכנה' },
];

const ISRAEL_CITIES: Array<{ en: string; he: string }> = [
  { en: 'Tel Aviv', he: 'תל אביב' },
  { en: 'Jerusalem', he: 'ירושלים' },
  { en: 'Haifa', he: 'חיפה' },
  { en: 'Beersheba', he: 'באר שבע' },
  { en: 'Rishon LeZion', he: 'ראשון לציון' },
  { en: 'Petah Tikva', he: 'פתח תקווה' },
];

function isHebrew(text: string) {
  if (!text) return false;
  const ch = text.trim().charAt(0);
  return /[\u0590-\u05FF]/.test(ch);
}

function filterSuggestions(list: Array<{ en: string; he: string }>, value: string, langIsHeb: boolean) {
  const q = value.trim().toLowerCase();
  if (!q) return list.slice(0, 6);
  const matched = list.filter(item => {
    const text = (langIsHeb ? item.he : item.en).toLowerCase();
    return text.includes(q);
  });
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
  const title = controlledTitle !== undefined ? controlledTitle : innerTitle;
  const setTitle = controlledSetTitle !== undefined ? controlledSetTitle : setInnerTitle;
  const location = controlledLocation !== undefined ? controlledLocation : innerLocation;
  const setLocation = controlledSetLocation !== undefined ? controlledSetLocation : setInnerLocation;
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const locRef = useRef<HTMLInputElement | null>(null);
  const titleWrapperRef = useRef<HTMLDivElement | null>(null);
  const locWrapperRef = useRef<HTMLDivElement | null>(null);

  const titleLangHeb = useMemo(() => isHebrew(title), [title]);
  const locLangHeb = useMemo(() => isHebrew(location), [location]);

  const titleSuggestions = useMemo(() => filterSuggestions(JOB_SUGGESTIONS, title, titleLangHeb), [title, titleLangHeb]);
  const locationSuggestions = useMemo(() => filterSuggestions(ISRAEL_CITIES, location, locLangHeb), [location, locLangHeb]);

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


  const doSearch = () => {
    const params = new URLSearchParams();
    if (title.trim()) params.set('title', title.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="search-container" style={{ width: '100%' }}>
      <div className="search-row">
        <div className="search-field" ref={titleWrapperRef} style={{position:'relative'}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><MagnifierIcon /></span>
          <input
            ref={titleRef}
            value={title}
            onChange={e => { setTitle(e.target.value); setShowTitleSuggestions(true); }}
            onFocus={() => setShowTitleSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 120)}
            placeholder="Search your next job"
            className="input"
            style={{paddingLeft: '40px'}}
          />
          {title.trim() !== '' && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setTitle(''); titleRef.current?.focus(); }}
              aria-label="Clear title"
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',padding:6,cursor:'pointer',color:'#64748b'}}
            >
              <ArrowIcon />
            </button>
          )}
          {showTitleSuggestions && titleSuggestions.length > 0 && (
            <ul className="suggestions">
              {titleSuggestions.map((s, i) => (
                <li
                  key={i}
                  onMouseDown={e => {
                    e.preventDefault();
                    setTitle(titleLangHeb ? s.he : s.en);
                    setShowTitleSuggestions(false);
                  }}
                >
                  {titleLangHeb ? s.he : s.en}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* City input only */}
        <div className="search-field city-distance-wrapper">
          <div
            className={
              "city-distance-city city-distance-city--expanded"
            }
            ref={locWrapperRef}
            style={{position:'relative'}}
          >
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><LocationIcon /></span>
            <input
              ref={locRef}
              value={location}
              onChange={e => { setLocation(e.target.value); setShowLocationSuggestions(true); }}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 120)}
              placeholder="Where is your next job?"
              className="input city-distance-input"
              style={{ width: '100%', paddingLeft: '40px' }}
            />
            {location.trim() !== '' && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setLocation(''); locRef.current?.focus(); }}
                aria-label="Clear location"
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',padding:6,cursor:'pointer',color:'#64748b'}}
              >
                <ArrowIcon />
              </button>
            )}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <ul className="suggestions">
                {locationSuggestions.map((s, i) => (
                  <li
                    key={i}
                    onMouseDown={e => {
                      e.preventDefault();
                      setLocation(locLangHeb ? s.he : s.en);
                      setShowLocationSuggestions(false);
                    }}
                  >
                    {locLangHeb ? s.he : s.en}
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
