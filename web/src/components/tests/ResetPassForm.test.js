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
  act(() => {
    render(
      // render SignUp page before each test
      <MemoryRouter initialEntries={["/ResetPassForm"]}>
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

test("elements in ResetPassForm", () => {
  expect(screen.getByTestId("LockOutlinedIcon")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Reset password", level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /username/i })).toHaveAttribute(
    "required",
  );
  const passInputs = screen.getAllByLabelText(/password/i);
  expect(passInputs.length).toBe(2);
  for (let passInput of passInputs) {
    expect(passInput).toHaveAttribute("required");
    expect(passInput).toHaveAttribute("type", "password");
  }
  expect(screen.getByRole("button", { name: /send/i })).toHaveAttribute(
    "type",
    "submit",
  );
});

test("click send button ResetPassForm success", async () => {
  // mock fetch calls
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
      status: 200,
    }),
  );

  const sendButton = screen.getByRole("button", { name: /send/i });
  expect(sendButton).toBeInTheDocument();
  await act(async () => {
    userEvent.click(sendButton);
  });

  expect(screen.getAllByRole("heading").length).toBe(2);

  expect(screen.getByRole("heading", { level: 1 }).innerHTML).toContain(
    "Password Restablish!",
  );
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: /You have succefully reset your password./i,
    }),
  ).toBeInTheDocument();
});

test("click send button ResetPassForm fails", async () => {
  // mock fetch calls
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ code: 500, message: "error description" }),
      status: 500,
    }),
  );

  const sendButton = screen.getByRole("button", { name: /send/i });
  expect(sendButton).toBeInTheDocument();
  await act(async () => {
    userEvent.click(sendButton);
  });

  expect(screen.getAllByRole("heading").length).toBe(2);

  expect(screen.getByRole("heading", { level: 1 }).innerHTML).toContain(
    "Something went wrong",
  );
  expect(screen.getByRole("heading", { level: 2 }).innerHTML).toContain(
    "We are going to check this opertaion.",
  );
});
