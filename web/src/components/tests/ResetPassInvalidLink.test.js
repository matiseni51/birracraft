import { cleanup, render, screen } from "@testing-library/react";
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
      <MemoryRouter initialEntries={["/ResetPassInvalidLink"]}>
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

test("elements in ResetPassInvalidLink", () => {
  expect(screen.getAllByRole("heading").length).toBe(2);

  expect(screen.getByRole("heading", { level: 1 }).innerHTML).toContain(
    "Something went wrong...",
  );
  expect(screen.getByRole("heading", { level: 2 }).innerHTML).toContain(
    "The link used is invalid. Try again from the begging.",
  );
});
