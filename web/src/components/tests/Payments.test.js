import { cleanup, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Contents from "../Contents";

let container = null;

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
      <MemoryRouter initialEntries={["/Payments"]}>
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

test("elements in Payments", () => {
  expect(
    screen.getByRole("heading", { name: "Payments", level: 3 }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Quotas", level: 3 }),
  ).toBeInTheDocument();
  // Payment's table columns
  expect(screen.getAllByRole("columnheader").length).toBe(7);
  expect(
    screen.getByRole("columnheader", { name: "Transaction" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Amount" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Method" }),
  ).toBeInTheDocument();
  // Quota's table columns
  expect(
    screen.getByRole("columnheader", { name: "Quota number" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Total quotas" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Value" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Date" }),
  ).toBeInTheDocument();

  expect(screen.getAllByRole("row", { name: /rows per page/i }).length).toBe(2);
});
