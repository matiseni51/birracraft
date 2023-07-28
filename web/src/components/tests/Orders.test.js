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
      <MemoryRouter initialEntries={["/Orders"]}>
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

test("elements in Orders", () => {
  expect(
    screen.getByRole("heading", { name: "Orders", level: 3 }),
  ).toBeInTheDocument();
  // Order's table columns
  expect(screen.getAllByRole("columnheader").length).toBe(9);
  expect(
    screen.getByRole("columnheader", { name: "Date" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Products" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Price" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Delivery cost" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Total amount" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Customer" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Payment transaction" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "State" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Comment" }),
  ).toBeInTheDocument();

  expect(screen.getByText(/new/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type",
    "button",
  );

  expect(
    screen.getByRole("row", { name: /rows per page/i }),
  ).toBeInTheDocument();
});

test("click New button - elements", () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(
    screen.getByRole("dialog", { name: "Create New Order" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Create New Order", level: 2 }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("textbox").length).toBe(4);
  expect(screen.getByRole("textbox", { name: "Price" })).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "Delivery Cost" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "Total Amount" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Comment" })).toBeInTheDocument();
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
    screen.getByRole("dialog", { name: "Create New Order" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Create New Order", level: 2 }),
  ).toBeInTheDocument();

  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toHaveAttribute("type", "submit");

  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ pk: 1 }) }),
  );

  await act(async () => {
    userEvent.click(saveButton);
  });

  // check for reload
  expect(window.location.reload).toHaveBeenCalled();
});

test("click New button - click Save fails", async () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(
    screen.getByRole("dialog", { name: "Create New Order" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Create New Order", level: 2 }),
  ).toBeInTheDocument();

  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toHaveAttribute("type", "submit");

  await act(async () => {
    userEvent.click(saveButton);
  });

  // mock fetch return empty list & the page waits for pk, thus fails.
  expect(screen.getByText(/wrong/i)).toBeInTheDocument();
});
