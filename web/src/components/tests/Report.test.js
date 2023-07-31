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
  window.localStorage.setItem(
    "authTokens",
    '{"refresh":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", \
    "access":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}',
  );
  act(() => {
    render(
      // render home page before each test
      <MemoryRouter initialEntries={["/Report"]}>
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

test("elements in Report", () => {
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

test("click generate Report button", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) }),
  );

  const generateButton = screen.getByRole("button", {
    name: /generate report/i,
  });
  expect(generateButton).toBeInTheDocument();
  await act(async () => {
    userEvent.click(generateButton);
  });

  expect(screen.getByText(/report sent/i)).toBeInTheDocument();
  expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
});
