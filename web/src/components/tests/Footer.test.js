import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

test("elements in Footer", () => {
  render(<Footer />);
  expect(screen.getByTestId("FacebookIcon"));
  expect(screen.getByTestId("InstagramIcon"));
  expect(screen.getByTestId("TwitterIcon"));
  expect(screen.getByTestId("WhatsAppIcon"));
  expect(screen.getByTestId("YouTubeIcon"));
  expect(screen.getByText(/copyright/i)).toBeInTheDocument();
  expect(screen.getByText(/All RIght Reserved/i)).toBeInTheDocument();
  const linkElement = screen.getByRole("link", { name: /birracraft/i });
  expect(linkElement.href).toContain("birracraft");
});
