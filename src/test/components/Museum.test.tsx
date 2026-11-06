import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { Museum } from '../../pages/Museum';

describe('Inside Joke Museum Component', () => {
  it('renders all four case cards including Case 001 headline attraction', () => {
    render(
      <HashRouter>
        <Museum />
      </HashRouter>
    );

    expect(screen.getByText('Inside Joke Museum')).toBeDefined();
    expect(screen.getByText('DORA KI MUMMY KAHAN HAI?')).toBeDefined();
    expect(screen.getByText('The Great Family Relationship Confusion')).toBeDefined();
    expect(screen.getByText('The Choti Moti Dossier')).toBeDefined();
    expect(screen.getByText('The Mumma\'s Boy Investigation')).toBeDefined();
  });
});

