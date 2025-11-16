import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 001.056 4.636 1.875 1.875 0 003.484 0 9.75 9.75 0 001.056-4.636zM12 3.75a9.75 9.75 0 019.75 9.75h-19.5A9.75 9.75 0 0112 3.75z" />
  </svg>
);

export default TrophyIcon;