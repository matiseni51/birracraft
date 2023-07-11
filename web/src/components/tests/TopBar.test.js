import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
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
  cleanup();
});

const authenticate = () => {
  // setting localStorage before rendering the page.
  cleanup();
  window.localStorage.setItem(
    'authTokens',
    '{"refresh":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "access":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}'
  );
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
}

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

test("elements in auth-TopBar", () => {
  authenticate();

  expect(screen.queryByText(/welcome/i)).toBeInTheDocument();
  expect(screen.getByText("Orders")).toBeInTheDocument();
  expect(screen.getByText("Payments")).toBeInTheDocument();
  expect(screen.getByText("Products")).toBeInTheDocument();
  expect(screen.getByText("Customers")).toBeInTheDocument();
  expect(screen.getByText("Report")).toBeInTheDocument();

  expect(screen.getByTestId("PersonIcon")).toBeInTheDocument();
  expect(screen.getByText("Profile")).toBeInTheDocument();
  expect(screen.getByText("Account")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});

test("auth-TopBar click Payments link", async () => {
  authenticate();

  // mock fetch return empty list
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([])}));

  const paymentsLink = screen.getByText("Payments");
  expect(paymentsLink).toBeInTheDocument();
  await act( async () => {
    userEvent.click(paymentsLink);
  });

  // Payment's table columns
  expect(screen.getByText(/transaction/i)).toBeInTheDocument();
  expect(screen.getByText(/amount/i)).toBeInTheDocument();
  expect(screen.getByText(/method/i)).toBeInTheDocument();
  // Quota's table columns
  expect(screen.getByText(/quota number/i)).toBeInTheDocument();
  expect(screen.getByText(/total quotas/i)).toBeInTheDocument();
  expect(screen.getByText(/value/i)).toBeInTheDocument();
  expect(screen.getByText(/date/i)).toBeInTheDocument();
});