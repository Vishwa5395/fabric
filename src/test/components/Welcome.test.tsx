import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { Welcome } from '../../pages/Welcome';

describe('Welcome Desk Component', () => {
  it('renders exact approved headlines and copy', () => {
    render(
      <HashRouter>
        <Welcome />
      </HashRouter>
    );

    expect(screen.getByText('Arre Mausami Ji, kaise hai aap?')).toBeDefined();
    expect(screen.getByText('Aapke liye kuch banaya hai...')).toBeDefined();
    expect(
      screen.getByText(/Thoda timepass hai, kuch purane jokes hain, kuch naye memes hain/i)
    ).toBeDefined();
    expect(screen.getByText('CHALO, DEKHTE HAIN!')).toBeDefined();
    expect(screen.getByText(/Waise entry free hai. Nakhre optional hain. :P/i)).toBeDefined();
  });

  it('triggers navigation on CTA button click', () => {
    render(
      <HashRouter>
        <Welcome />
      </HashRouter>
    );

    const ctaBtn = screen.getByRole('button', { name: /CHALO, DEKHTE HAIN!/i });
    fireEvent.click(ctaBtn);
    expect(window.location.hash).toBe('#/hq');
  });
});

