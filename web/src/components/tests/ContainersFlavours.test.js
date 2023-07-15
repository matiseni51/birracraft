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
      <MemoryRouter initialEntries={["/ContainersFlavours"]}>
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

test("elements in ContainersFlavours", () => {
  expect(screen.getByRole("heading", { name: "Containers", level: 4 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Flavours", level: 4 })).toBeInTheDocument();

  // Container's table columns
  expect(screen.getAllByRole("columnheader").length).toBe(5);
  expect(screen.getByRole("columnheader", { name: "Type" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Liters" })).toBeInTheDocument();
  // Flavour's table columns
  expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Description" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Price per lt" })).toBeInTheDocument();


  screen.getAllByRole("button", { name: /new/i }).forEach((item) => {
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute(
      "type", "button"
    );
  });
  expect(screen.getAllByTestId("AddCircleIcon")).toHaveLength(2);

  expect(screen.getAllByRole("row", { name: /rows per page/i })).toHaveLength(2);
});

test("click Container New button - elements", () => {
  const newContainersButton = screen.getAllByRole("button", { name: /new/i })[0];
  expect(newContainersButton).toBeInTheDocument();
  userEvent.click(newContainersButton);

  expect(screen.getByRole("dialog", { name: "Create New Container" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Create New Container", level: 2 })).toBeInTheDocument();

  expect(
    [...document.getElementsByTagName("input")].find((item) => item.name == "type")
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Liters"})).toBeInTheDocument();
});

test("click Flavours New button - elements", () => {
  const newFlavoursButton = screen.getAllByRole("button", { name: /new/i })[1];
  expect(newFlavoursButton).toBeInTheDocument();
  userEvent.click(newFlavoursButton);

  expect(screen.getByRole("dialog", { name: "Create New Flavour" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Create New Flavour", level: 2 })).toBeInTheDocument();

  expect(screen.getAllByRole("textbox")).toHaveLength(3);
  expect(screen.getByRole("textbox", { name: "Name"})).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Price per liter"})).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Description"})).toBeInTheDocument();
});

test("click Container New button - click Save success", async () => {
  const newContainersButton = screen.getAllByRole("button", { name: /new/i })[0];
  expect(newContainersButton).toBeInTheDocument();
  userEvent.click(newContainersButton);

  expect(screen.getByText(
    "Add a new container to assign to a product."
  )).toBeInTheDocument();

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

test("click Flavour New button - click Save success", async () => {
  const newFlavoursButton = screen.getAllByRole("button", { name: /new/i })[1];
  expect(newFlavoursButton).toBeInTheDocument();
  userEvent.click(newFlavoursButton);

  expect(screen.getByText(
    "Add a new flavour to assign to a product."
  )).toBeInTheDocument();

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

test("click Container New button - click Save fails", async () => {
  const newContainersButton = screen.getAllByRole("button", { name: /new/i })[0];
  expect(newContainersButton).toBeInTheDocument();
  userEvent.click(newContainersButton);

  expect(screen.getByText(
    "Add a new container to assign to a product."
  )).toBeInTheDocument();

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

test("click Flavour New button - click Save fails", async () => {
  const newFlavoursButton = screen.getAllByRole("button", { name: /new/i })[1];
  expect(newFlavoursButton).toBeInTheDocument();
  userEvent.click(newFlavoursButton);

  expect(screen.getByText(
    "Add a new flavour to assign to a product."
  )).toBeInTheDocument();

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