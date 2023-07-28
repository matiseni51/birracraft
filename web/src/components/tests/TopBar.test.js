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
      container,
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
    "authTokens",
    '{"refresh":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", \
    "access":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}',
  );
  window.localStorage.setItem(
    "authUser",
    '{"username":"sam","password":"sam123"}',
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
      container,
    );
  });
};

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
    "MuiContainer-root MuiContainer-maxWidthSm MuiContainer-disableGutters",
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
    "SignIn",
  );
  const signInButton = screen.getByText("Sign In");
  expect(signInButton).toBeInTheDocument();
  userEvent.click(signInButton);

  // check Sign in page was render.
  expect(screen.getByRole("main").children[0]).toHaveStyle(
    "background-image: url(sativa_banner2.jpg)",
  );
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByText("Sign in")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /username/i })).toHaveAttribute(
    "required",
  );
  expect(screen.getByLabelText(/password/i)).toHaveAttribute("required");
  expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
});

test("click Register button", () => {
  // place on landing page
  expect(screen.queryByText(/welcome/i)).toBeInTheDocument();

  // button verifications
  expect(screen.getByRole("link", { name: /register/i }).href).toContain(
    "SignUp",
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
  expect(screen.getByLabelText(/open settings/i)).toBeInTheDocument();
  expect(screen.getByText("Profile")).toBeInTheDocument();
  expect(screen.getByText("Account")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});

test("click Logo button in auth-TopBar", () => {
  authenticate();
  // place on landing page with authentication
  expect(screen.queryByText(/welcome/i)).toBeInTheDocument();
  expect(screen.getByTestId("PersonIcon")).toBeInTheDocument();

  // button verifications
  expect(screen.getByRole("link", { name: "" }).href).toContain("/");
  const logoButton = screen.getByRole("link", { name: "" });
  expect(logoButton).toBeInTheDocument();
  userEvent.click(logoButton);

  // check home page was render.
  const div = document.getElementsByClassName(
    "MuiContainer-root MuiContainer-maxWidthSm MuiContainer-disableGutters",
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

test("auth-TopBar click Orders link", async () => {
  authenticate();

  // mock fetch return empty list
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) }),
  );

  const ordersLink = screen.getByText("Orders");
  expect(ordersLink).toBeInTheDocument();
  await act(async () => {
    userEvent.click(ordersLink);
  });

  // Title
  expect(
    screen.getByRole("heading", { name: "Orders", level: 3 }),
  ).toBeInTheDocument();

  // Order's table columns
  expect(screen.getByText(/date/i)).toBeInTheDocument();
  // Column  & topbar link
  const productsElements = screen.queryAllByText(/products/i);
  expect(productsElements.length).toBe(2);
  expect(screen.getByText(/price/i)).toBeInTheDocument();
  expect(screen.getByText(/delivery cost/i)).toBeInTheDocument();
  expect(screen.getByText(/total amount/i)).toBeInTheDocument();
  // Column  & topbar link
  const customersElements = screen.queryAllByText(/customer/i);
  expect(customersElements.length).toBe(2);
  expect(screen.getByText(/payment transaction/i)).toBeInTheDocument();
  expect(screen.getByText(/state/i)).toBeInTheDocument();
  expect(screen.getByText(/comment/i)).toBeInTheDocument();

  expect(screen.getByText(/new/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type",
    "button",
  );
});

test("auth-TopBar click Payments link", async () => {
  authenticate();

  // mock fetch return empty list
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) }),
  );

  const paymentsLink = screen.getByText("Payments");
  expect(paymentsLink).toBeInTheDocument();
  await act(async () => {
    userEvent.click(paymentsLink);
  });

  // Title
  expect(
    screen.getByRole("heading", { name: "Payments", level: 3 }),
  ).toBeInTheDocument();

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

test("auth-TopBar click Products link", async () => {
  authenticate();

  // mock fetch return empty list
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) }),
  );

  const productsLink = screen.getByText("Products");
  expect(productsLink).toBeInTheDocument();
  await act(async () => {
    userEvent.click(productsLink);
  });

  // Title
  expect(
    screen.getByRole("heading", { name: "Products", level: 3 }),
  ).toBeInTheDocument();

  // Product's table columns
  expect(screen.getByText(/code/i)).toBeInTheDocument();
  const containersElements = screen.getAllByText(/container/i);
  expect(containersElements.length).toBe(2);
  const flavoursElements = screen.getAllByText(/container/i);
  expect(flavoursElements.length).toBe(2);
  expect(screen.getByText(/arrived date/i)).toBeInTheDocument();
  expect(screen.getByText(/price/i)).toBeInTheDocument();
  expect(screen.getByText(/state/i)).toBeInTheDocument();

  expect(screen.getByText(/containers & flavours/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /containers & flavours/i }),
  ).toHaveAttribute("type", "button");
  expect(screen.getByText(/new/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type",
    "button",
  );
});

test("auth-TopBar click Customers link", async () => {
  authenticate();

  // mock fetch return empty list
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) }),
  );

  const customersLink = screen.getByText("Customers");
  expect(customersLink).toBeInTheDocument();
  await act(async () => {
    userEvent.click(customersLink);
  });

  // Title
  expect(
    screen.getByRole("heading", { name: "Customers", level: 3 }),
  ).toBeInTheDocument();

  // Customer's table columns
  expect(screen.getByText(/name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
  expect(screen.getByText(/phone number/i)).toBeInTheDocument();
  expect(screen.getByText(/address/i)).toBeInTheDocument();
  expect(screen.getByText(/type/i)).toBeInTheDocument();

  expect(screen.getByText(/new/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type",
    "button",
  );
});

test("auth-TopBar click Report link", async () => {
  authenticate();

  const reportLink = screen.getByText("Report");
  expect(reportLink).toBeInTheDocument();
  userEvent.click(reportLink);

  expect(screen.getByTestId("ArticleIcon")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Report", level: 1 }),
  ).toBeInTheDocument();
  const dateFromInput = document.getElementById("dateFrom");
  expect(dateFromInput).toHaveAttribute("type", "date");
  expect(screen.getByText(/generate report/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /generate report/i }),
  ).toHaveAttribute("type", "submit");
});

test("auth-TopBar click personIcon menu", async () => {
  authenticate();

  const settingsButton = screen.getByRole("button", { name: /open settings/i });
  expect(settingsButton).toBe(screen.getByLabelText(/open settings/i));

  await act(async () => {
    userEvent.click(settingsButton);
  });

  expect(
    screen.getByRole("menuitem", { name: /profile/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: /account/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: /logout/i })).toBeInTheDocument();
});

test("auth-TopBar click Profile link", async () => {
  authenticate();

  // mock fetch return empty list
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          model: "auth.user",
          pk: 2,
          fields: {
            password: "pbkdf2_sha256$320000$EDIXjhKxvKE=",
            last_login: null,
            is_superuser: false,
            username: "sam",
            first_name: "samuel",
            last_name: "smith",
            email: "ss@birracraft.io",
            is_staff: false,
            is_active: true,
            date_joined: "2023-07-10T18:39:39.614Z",
            groups: [],
            user_permissions: [],
          },
        }),
    }),
  );

  const settingsButton = screen.getByRole("button", { name: /open settings/i });
  expect(settingsButton).toBe(screen.getByLabelText(/open settings/i));

  await act(async () => {
    userEvent.click(settingsButton);
  });

  const profileLink = screen.getByRole("menuitem", { name: /profile/i });
  expect(profileLink).toBeInTheDocument();

  await act(async () => {
    userEvent.click(profileLink);
  });

  // Title
  expect(screen.getByTestId("AccountBoxIcon")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Profile Data", level: 1 }),
  ).toBeInTheDocument();

  expect(screen.getByRole("textbox", { name: "sam" }).id).toContain("username");
  expect(screen.getByRole("textbox", { name: "samuel" }).id).toContain(
    "firstName",
  );
  expect(screen.getByRole("textbox", { name: "smith" }).id).toContain(
    "lastName",
  );
  expect(
    screen.getByRole("textbox", { name: "ss@birracraft.io" }).id,
  ).toContain("email");

  expect(screen.getByRole("button", { name: /edit/i })).toHaveAttribute(
    "type",
    "button",
  );
  expect(screen.getByRole("button", { name: /submit/i })).toHaveAttribute(
    "type",
    "submit",
  );
});

test("auth-TopBar click Logout link", async () => {
  authenticate();

  const settingsButton = screen.getByRole("button", { name: /open settings/i });
  expect(settingsButton).toBe(screen.getByLabelText(/open settings/i));

  await act(async () => {
    userEvent.click(settingsButton);
  });

  const logoutLink = screen.getByRole("menuitem", { name: /logout/i });
  expect(logoutLink).toBeInTheDocument();

  await act(async () => {
    userEvent.click(logoutLink);
  });

  expect(window.localStorage.getItem("authTokens")).toBeNull();

  // check Sign in page was render.
  expect(screen.getByRole("main").children[0]).toHaveStyle(
    "background-image: url(sativa_banner2.jpg)",
  );
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(screen.getByText("Sign in")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /username/i })).toHaveAttribute(
    "required",
  );
  expect(screen.getByLabelText(/password/i)).toHaveAttribute("required");
  expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
});
