import { cleanup, render, screen } from "@testing-library/react";
import ActivationFail from "../registration/ActivationFail";
import ActivationSuccess from "../registration/ActivationSuccess";

afterEach(() => {
  // cleanup on exiting
  cleanup();
});

test("elements in ActivationSuccess", () => {
  render(<ActivationSuccess />);

  expect(screen.getAllByRole("heading").length).toBe(2);

  expect(screen.getByRole("heading", { level: 1 }).innerHTML).toContain(
    "Registration Completed!",
  );
  expect(screen.getByRole("heading", { level: 2 }).innerHTML).toContain(
    "Your new account was activated.",
  );
  expect(screen.getByRole("link", { name: /sign in/i }).href).toContain(
    "/SignIn",
  );
});

test("elements in ActivationFails", () => {
  render(<ActivationFail />);

  expect(screen.getAllByRole("heading").length).toBe(2);

  expect(screen.getByRole("heading", { level: 1 }).innerHTML).toContain(
    "Verification failed!",
  );
  expect(screen.getByRole("heading", { level: 2 }).innerHTML).toContain(
    "It seems some data",
  );
});
