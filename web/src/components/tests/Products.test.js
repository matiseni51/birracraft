import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Contents from "../Contents";

let container = null;

const original = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: jest.fn() },
  });
});

beforeEach(async() => {
  // authentication data
  window.localStorage.setItem(
    'authTokens',
    '{"refresh":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", \
    "access":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}'
  );
  // set initial request
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([])}));
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  await act( async() => {
    render(
      // render home page before each test
      <MemoryRouter initialEntries={["/Products"]}>
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

afterAll(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: original });
});

test("elements in Products", () => {
  expect(screen.getByRole("heading", { name: "Products", level: 3 })).toBeInTheDocument();
  // Product's table columns
  expect(screen.getAllByRole("columnheader").length).toBe(6);
  expect(screen.getByRole("columnheader", { name: "Code" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Container" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Flavour" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Arrived Date" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Price" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "State" })).toBeInTheDocument();
  
  expect(screen.getByText(/containers & flavours/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /containers & flavours/i })).toHaveAttribute(
    "type", "button"
  );
  expect(screen.getByTestId("SettingsIcon")).toBeInTheDocument();

  expect(screen.getByText(/new/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new/i })).toHaveAttribute(
    "type", "button"
  );
  expect(screen.getByTestId("AddCircleIcon")).toBeInTheDocument();

  expect(screen.getByRole("row", { name: /rows per page/i })).toBeInTheDocument();
});

test("click Containers & Flavours button", async () => {
  const cfButton = screen.getByRole("button", { name: /containers & flavours/i });
  expect(cfButton).toBeInTheDocument();
  await act(async () => {
    await userEvent.click(cfButton);
  })

  expect(screen.getByRole("heading", { name: "Containers", level: 4 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Flavours", level: 4 })).toBeInTheDocument();

  expect(screen.getAllByRole("button", { name: "New" }).length).toBe(2);
});

test("click New button - elements", () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(screen.getByRole("dialog", { name: "Create New Product" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Create New Product", level: 2 })).toBeInTheDocument();

  expect(screen.getByRole("spinbutton", { name: "Code" })).toBeInTheDocument();
  
  // 6 inputs: 5 in the modal & the index in "Rows per page"
  expect(document.getElementsByTagName("input").length).toBe(6);

  for (let element of document.getElementsByTagName("input")){
    if (element.name) expect(element.name).toMatch(/container|flavour|code|arrived_date|state/)
  }
  expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
    "type", "submit"
  );
});


test("click New button - click Save success", async () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(screen.getByRole("heading", { name: "Create New Product", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("Add a new product.")).toBeInTheDocument();

  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toHaveAttribute(
    "type", "submit"
  );

  // mock fetch to succeed before clicking Save
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({pk: 1})}));

  await act( async () => {
    userEvent.click(saveButton);
  });

  // check for reload
  expect(window.location.reload).toHaveBeenCalledTimes(1);
});

test("click New button - click Save fails", async () => {
  const newButton = screen.getByRole("button", { name: /new/i });
  expect(newButton).toBeInTheDocument();
  userEvent.click(newButton);

  expect(screen.getByRole("heading", { name: "Create New Product", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("Add a new product.")).toBeInTheDocument();

  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toHaveAttribute(
    "type", "submit"
  );

  await act( async () => {
    userEvent.click(saveButton);
  });

  // mock fetch return empty list & the page waits for pk, thus fails.
  expect(screen.getByText(/wrong/i)).toBeInTheDocument();
});