import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../components/layout/Footer';

describe('Footer', () => {
  it('renders footer content', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
