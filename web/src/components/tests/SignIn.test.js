import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Contents from "../Contents";

let container = null;


beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    render(
      // render SignUp page before each test
      <MemoryRouter initialEntries={["/SignIn"]}>
        <Contents />
      </MemoryRouter>,
      container
    );
  });
});

afterEach(() => {
  // cleanup on exiting
  cleanup();
});

test("elements in SignIn page", () => {
  expect(screen.getByRole("main").children[0]).toHaveStyle(
    "background-image: url(sativa_banner2.jpg)"
  );
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByText("Sign in")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /username/i })).toHaveAttribute(
    "required"
  );
  expect(screen.getByLabelText(/password/i)).toHaveAttribute("required");
  expect(screen.getByRole("button", { name: /sign in/i })).toHaveAttribute(
    "type", "submit"
  );
  expect(screen.getByRole(
    "link", { name: /forgot password/i }).href
  ).toContain("/ResetPass");
  expect(screen.getByRole(
    "link", { name: /have an account/i }).href
  ).toContain("/SignUp");
});

test("click Reset Password text link", () => {
  const resetPassLink = screen.getByRole(
    "link", { name: "Forgot password?" }
  )
  expect(resetPassLink.href).toContain("/ResetPass");
  userEvent.click(resetPassLink);

  // Check for reset password page rendering.
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByRole(
    "heading", { name: "Reset password", level: 1 }
  )).toBeInTheDocument();
});

test("click Sign Up text link", () => {
  const signUpLink = screen.getByRole(
    "link", { name: /have an account\?/ }
  )
  expect(signUpLink.href).toContain("/SignUp");
  userEvent.click(signUpLink);

  // Check for SignUp page rendering.
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByRole(
    "heading", { name: "Sign up", level: 1 }
  )).toBeInTheDocument();
  expect(screen.getAllByRole("textbox").length).toBe(4);
});

test("submit-click Sign In button success", async () => {
  // mock fetch calls
  global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve([]),
    status: 200})
  );

  const signInButton = screen.getByRole("button", { name: /sign in/i });
  expect(signInButton).toHaveAttribute(
    "type", "submit"
  );

  await act( async () => {
    userEvent.click(signInButton);
  });

  // render navigate('/Orders')
  expect(screen.getByRole(
    "heading", { name: "Orders", level: 3 })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type", "button"
  );
});

test("submit-click Sign In button fails", async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve([])
  }));

  const signInButton = screen.getByRole("button", { name: /sign in/i });
  expect(signInButton).toHaveAttribute(
    "type", "submit"
  );

  await act( async () => {
    userEvent.click(signInButton);
  });

  // Check for modal displaying.
  expect(screen.getByRole(
    "heading", { name: /password incorrect/i, level: 2 }
  )).toBeInTheDocument();
  expect(screen.getByText(
    "The input data is incorrect. Check the credentials used"
  )).toBeInTheDocument();
});