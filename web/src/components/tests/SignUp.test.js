import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { unmountComponentAtNode } from "react-dom";
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
      <MemoryRouter initialEntries={["/SignUp"]}>
        <Contents />
      </MemoryRouter>,
      container
    );
  });
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  cleanup();
});


test("elements in SignUp form", () => {
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /first name/i })).toHaveAttribute(
    "required"
  );
  expect(screen.getByRole("textbox", { name: /last name/i })).toHaveAttribute(
    "required"
  );
  expect(screen.getByRole("textbox", { name: /username/i })).toHaveAttribute(
    "required"
  );
  expect(screen.getByRole("textbox", { name: /email address/i })).toHaveAttribute(
    "required"
  );
  const passInput = screen.getByLabelText(/password/i);
  expect(passInput).toHaveAttribute("required");
  expect(passInput).toHaveAttribute("type", "password");
  const form = screen.getAllByRole("textbox");
  // password doesn't belong to textbox -> library limitation
  expect(form.length).toBe(4);
  expect(screen.getByRole("button", { name: /sign up/i })).toHaveAttribute(
    "type", "submit"
  );
});

test("click Sign In text link", () => {
  expect(screen.getByRole(
    "link", { name: "Already have an account? Sign in" }
  ).href).toContain("/SignIn");
  const signInButton = screen.getByText("Already have an account? Sign in");
  expect(signInButton).toBeInTheDocument();
  userEvent.click(signInButton);

  expect(screen.getByText("Forgot password?")).toBeInTheDocument();
});

test("click Sign Up button success", async () => {
  // mock for a succeeded request
  global.fetch = jest.fn(() => new Promise((resolve, reject) => {
    let response = {status: 201, data: 'user data'};
    resolve(response);
  }));

  const signUpButton = screen.getByRole("button", { name: /sign up/i })
  expect(signUpButton).toBeInTheDocument();
  expect(signUpButton).toHaveAttribute(
    "type", "submit"
  );
  await userEvent.click(signUpButton);

  await waitFor(async () => expect(await screen.getByText(/verification/i)).toBeInTheDocument());
});

test("click Sign Up button fails", async () => {
  // mock for a failed request
  global.fetch = jest.fn(() => new Promise((resolve, reject) => {
    let response = {status: 400, data: 'user data'}; 
    resolve(response);
  }));

  const signUpButton = screen.getByRole("button", { name: /sign up/i })
  expect(signUpButton).toBeInTheDocument();
  expect(signUpButton).toHaveAttribute(
    "type", "submit"
  );
  await userEvent.click(signUpButton);

  await waitFor(async () => expect(await screen.getByText(/wrong/i)).toBeInTheDocument());
});
