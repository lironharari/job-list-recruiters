import React from 'react';
import { Link } from 'react-router-dom';

import Search from '../components/Search';

export default function Home() {
  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <h1>Israel’s leading companies are looking for you!</h1>
      <h2>Thousands of jobs are waiting just for you.</h2>
      <Search />
    </div>
  );
}
