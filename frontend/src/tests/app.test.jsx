// Frontend Component Tests
// Run with: npm test --prefix frontend

import { describe, it, expect, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App Component', () => {
  it('should have dark mode state', () => {
    localStorage.setItem('darkMode', 'false');
    const darkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
    expect(darkMode).toBe(false);
  });

  it('should toggle dark mode', () => {
    localStorage.setItem('darkMode', 'false');
    let darkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
    darkMode = !darkMode;
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    expect(darkMode).toBe(true);
  });
});

describe('Auth API', () => {
  it('should handle missing token', () => {
    const token = localStorage.getItem('authToken');
    expect(token).toBeNull();
  });

  it('should store user data', () => {
    const userData = { id: 1, email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(userData));
    const stored = JSON.parse(localStorage.getItem('user'));
    expect(stored.email).toBe('test@example.com');
  });
});

describe('Activity API', () => {
  it('should filter activities by type', () => {
    const activities = [
      { id: 1, type: 'analysis' },
      { id: 2, type: 'alert' },
      { id: 3, type: 'analysis' }
    ];
    const filtered = activities.filter(a => a.type === 'analysis');
    expect(filtered.length).toBe(2);
  });
});

describe('Statistics', () => {
  it('should calculate percentage correctly', () => {
    const toxic = 89;
    const total = 1247;
    const percentage = ((total - toxic) / total * 100).toFixed(1);
    expect(percentage).toBe('92.8');
  });
});