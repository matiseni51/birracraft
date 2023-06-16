import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { unmountComponentAtNode } from "react-dom";
import { MemoryRouter } from "react-router-dom";
import TopBar from "../TopBar";
import Contents from "../Contents";

let container = null;

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    render(
      // render home page before each test
      <MemoryRouter initialEntries={["/"]}>
        <TopBar />
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

test("elements in TopBar", () => {
  expect(screen.getByText("Sign In")).toBeInTheDocument();
  expect(screen.getByText("Register")).toBeInTheDocument();
  expect(screen.getByRole("img").src).toContain("sativa_logo");
});

test("click Logo button", () => {
  // place on landing page
  expect(screen.queryByText(/welcome/i)).toBeInTheDocument();

  // button verifications
  expect(screen.getByRole("link", { name: "" }).href).toContain("/");
  const logoButton = screen.getByRole("link", { name: "" });
  expect(logoButton).toBeInTheDocument();
  userEvent.click(logoButton);

  // check home page was render.
  const div = document.getElementsByClassName(
    "MuiContainer-root MuiContainer-maxWidthSm MuiContainer-disableGutters"
  );
  expect(div.length).toBe(1);
  const style = window.getComputedStyle(div[0]);
  expect(style.backgroundImage).toContain("sativa_banner");
  expect(screen.getByText("Company")).toBeInTheDocument();
  expect(screen.getByText("Features")).toBeInTheDocument();
  expect(screen.getByText("Resources")).toBeInTheDocument();
  expect(screen.getByText("Legal")).toBeInTheDocument();
  expect(screen.queryAllByRole("textbox").length).toBe(0);
});

test("click Sign In button", () => {
  // place on landing page
  expect(screen.queryByText(/welcome/i)).toBeInTheDocument();

  // button verifications
  expect(screen.getByRole("link", { name: /sign in/i }).href).toContain(
    "SignIn"
  );
  const signInButton = screen.getByText("Sign In");
  expect(signInButton).toBeInTheDocument();
  userEvent.click(signInButton);

  // check Sign in page was render.
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByText("Sign in")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /username/i })).toHaveAttribute(
    "required"
  );
  expect(screen.getByLabelText(/password/i)).toHaveAttribute("required");
  expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
});

test("click Register button", () => {
  // place on landing page
  expect(screen.queryByText(/welcome/i)).toBeInTheDocument();

  // button verifications
  expect(screen.getByRole("link", { name: /register/i }).href).toContain(
    "SignUp"
  );
  const registerButton = screen.getByText("Register");
  expect(registerButton).toBeInTheDocument();
  userEvent.click(registerButton);

  // check Sign up page was render.
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByText("Sign up")).toBeInTheDocument();
  const form = screen.getAllByRole("textbox");
  expect(form.length).toBeGreaterThanOrEqual(2);
  form.forEach((input) => {
    expect(input).toHaveAttribute("required");
  });
  expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
});
