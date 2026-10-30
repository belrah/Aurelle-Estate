import { afterEach, beforeAll, describe, it, expect, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../src/App";
beforeAll(() => {
  window.scrollTo = vi.fn();
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(cleanup);
function open(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}
describe("visitor interactions", () => {
  it("has working navigation and property links", () => {
    open("/");
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /The Palm Residence/ })[0],
    ).toHaveAttribute("href", "/properties/the-palm-residence");
  });
  it("filters listings on actual records and handles empty state", () => {
    open("/properties");
    fireEvent.click(screen.getByRole("button", { name: "Land for Sale" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 spaces");
    expect(
      screen.getByRole("link", { name: "Ibeju-Lekki Sample Plot" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: "unknown" },
    });
    expect(screen.getByText("No spaces match just yet.")).toBeInTheDocument();
  });
  it("validates the enquiry and explains demo delivery", async () => {
    open("/contact");
    fireEvent.click(screen.getByRole("button", { name: /Prepare enquiry/ }));
    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Your name"), {
      target: { value: "Ada Example" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "08012345678" },
    });
    fireEvent.change(screen.getByLabelText("Tell us a little more"), {
      target: { value: "I would like to book a property inspection." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Prepare enquiry/ }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Nothing has been sent or saved",
      ),
    );
  });
  it("blocks invalid agent steps", () => {
    open("/agents/sign-up");
    fireEvent.click(screen.getByRole("button", { name: /Next step/ }));
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("STEP 1 OF 4")).toBeInTheDocument();
  });
  it("renders mortgage inputs and a useful unknown page", async () => {
    const view = open("/mortgage");
    expect(
      await screen.findByLabelText("Property price (₦)", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    view.unmount();
    open("/a-missing-page");
    expect(
      screen.getByRole("heading", { name: "Let’s find your way home." }),
    ).toBeInTheDocument();
  });
});
