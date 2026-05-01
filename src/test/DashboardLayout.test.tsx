import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardLayout } from '../components/DashboardLayout';
import { BrowserRouter } from 'react-router-dom';

describe('DashboardLayout Accessibility & Rendering', () => {
  it('renders skip to main content link', () => {
    render(
      <BrowserRouter>
        <DashboardLayout title="Testing" subtitle="Test Subtitle">
          <div>Test Content</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders children and search correctly with ARIA labels', () => {
    render(
      <BrowserRouter>
        <DashboardLayout title="Testing" subtitle="Test Subtitle">
          <div>Test Content</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    // Use proper checking for hidden items if needed
    const kbd = screen.getByLabelText('Command K');
    expect(kbd).toBeInTheDocument();
  });
});
