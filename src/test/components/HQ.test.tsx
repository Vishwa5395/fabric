import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { HQ } from '../../pages/HQ';

describe('Department Headquarters (HQ) Component', () => {
  it('renders heading and all active department cards plus Final Transmission', () => {
    render(
      <HashRouter>
        <HQ />
      </HashRouter>
    );

    expect(screen.getByText('Aaj kya kaand karna hai?')).toBeDefined();

    // 7 Departments (Random Nonsense removed)
    expect(screen.queryByText('Random Nonsense')).toBeNull();
    expect(screen.getByText('Classified Notebook')).toBeDefined();
    expect(screen.getByText('Meme Department')).toBeDefined();
    expect(screen.getByText('Audio Diary')).toBeDefined();
    expect(screen.getByText('Background Music')).toBeDefined();
    expect(screen.getByText('Meme Court')).toBeDefined();
    expect(screen.getByText('Truth or Dare')).toBeDefined();
    expect(screen.getByText('Inside Joke Museum')).toBeDefined();
    expect(screen.getByText('Achievement Wall')).toBeDefined();

    // Special card
    expect(screen.getByText('Final Transmission')).toBeDefined();
  });
});
