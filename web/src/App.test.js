import { render, screen } from "@testing-library/react";
import App from "./App";

test("welcome_page", () => {
  render(<App />);
  const linkElement = screen.getByText(/welcome/i);
  expect(linkElement).toBeInTheDocument();
});
