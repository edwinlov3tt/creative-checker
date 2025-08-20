import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Creative Specs Validator header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Creative Specs Validator/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders Upload & Validate tab', () => {
  render(<App />);
  const uploadTab = screen.getByText(/Upload & Validate/i);
  expect(uploadTab).toBeInTheDocument();
});

test('renders tactic selection dropdown', () => {
  render(<App />);
  const tacticDropdown = screen.getByText(/Select Target Tactic/i);
  expect(tacticDropdown).toBeInTheDocument();
});
