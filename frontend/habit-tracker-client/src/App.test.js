import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => {
  const React = require('react');

  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => {
      const route = React.Children.toArray(children).find((child) => child.props?.path === '/login');
      return route?.props?.element || null;
    },
    Route: () => null,
    Navigate: () => null,
    Link: ({ children, to }) => React.createElement('a', { href: to }, children),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/login' }),
  };
}, { virtual: true });

const App = require('./App').default;

test('renders the login experience for signed-out users', async () => {
  localStorage.clear();
  render(<App />);
  expect(await screen.findByRole('heading', { name: /welcome back/i, level: 2 })).toBeInTheDocument();
});
