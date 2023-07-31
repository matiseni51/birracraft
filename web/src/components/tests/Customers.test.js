import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Contents from "../Contents";

let container = null;

const original = window.location;

beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { reload: jest.fn() },
  });
});

beforeEach(async () => {
  // authentication data
  window.localStorage.setItem(
    "authTokens",
    '{"refresh":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", \
    "access":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}',
  );
  // set initial request
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) }),
  );
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  await act(async () => {
    render(
      // render home page before each test
      <MemoryRouter initialEntries={["/Customers"]}>
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

afterAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: original,
  });
});

test("elements in Customers", () => {
  expect(
    screen.getByRole("heading", { name: "Customers", level: 3 }),
  ).toBeInTheDocument();
  // Customer's table columns
  expect(screen.getAllByRole("columnheader").length).toBe(5);
  expect(
    screen.getByRole("columnheader", { name: "Name" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Email" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Phone Number" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Address" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Type" }),
  ).toBeInTheDocument();

  expect(screen.getByText(/new/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type",
    "button",
  );
  expect(screen.getByTestId("AddCircleIcon")).toBeInTheDocument();

  expect(
    screen.getByRole("row", { name: /rows per page/i }),
  ).toBeInTheDocument();
});

test("click New button - elements", () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(
    screen.getByRole("dialog", { name: "Create New Customer" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Create New Customer", level: 2 }),
  ).toBeInTheDocument();

  expect(screen.getAllByRole("textbox")).toHaveLength(4);
  expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "Email Address" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "Phone Number" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Address" })).toBeInTheDocument();
  expect(
    [...document.getElementsByTagName("input")].find(
      (item) => item.name == "type",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
    "type",
    "submit",
  );
});

test("click New button - click Save success", async () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(
    screen.getByRole("heading", { name: "Create New Customer", level: 2 }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Add a new client to start assigned Orders."),
  ).toBeInTheDocument();

  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toHaveAttribute("type", "submit");

  // mock fetch to succeed before clicking Save
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ pk: 1 }) }),
  );

  await act(async () => {
    userEvent.click(saveButton);
  });

  // check for reload
  expect(window.location.reload).toHaveBeenCalledTimes(1);
});

test("click New button - click Save fails", async () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(
    screen.getByRole("heading", { name: "Create New Customer", level: 2 }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Add a new client to start assigned Orders."),
  ).toBeInTheDocument();

  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toHaveAttribute("type", "submit");

  await act(async () => {
    userEvent.click(saveButton);
  });

  // mock fetch return empty list & the page waits for pk, thus fails.
  expect(screen.getByText(/wrong/i)).toBeInTheDocument();
});
