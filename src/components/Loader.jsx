import React from 'react';
import Spinner from './ui/Spinner';

const Loader = ({ size = 'xl', color = 'indigo', className = '' }) => (
  <div className={`flex justify-center items-center h-full w-full ${className}`}>
    <Spinner size={size} color={color} />
  </div>
);

export default Loader;
