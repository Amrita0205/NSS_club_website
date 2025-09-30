'use client'

import { useEffect } from 'react';

export default function StudentIndexRedirect() {
  useEffect(() => {
    window.location.replace('/student/dashboard');
  }, []);
  return null;
}




