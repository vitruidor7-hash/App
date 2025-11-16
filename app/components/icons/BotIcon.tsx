
import React from 'react';

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4.5 3.75A.75.75 0 015.25 3h13.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V3.75zM9 9a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z"
      clipRule="evenodd"
    />
    <path d="M3 10.5v5.034a3.75 3.75 0 003.75 3.75h10.5a3.75 3.75 0 003.75-3.75V10.5a.75.75 0 011.5 0v5.034a5.25 5.25 0 01-5.25 5.25h-10.5a5.25 5.25 0 01-5.25-5.25V10.5a.75.75 0 011.5 0z" />
  </svg>
);

export default BotIcon;
