import type { Message } from "@ai-sdk/react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Page from "../app/page";

// Type for mock localStorage
interface MockLocalStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

// Mock the useChat hook from @ai-sdk/react
vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    status: "idle",
    stop: vi.fn(),
    setMessages: vi.fn(),
  })),
}));

// Mock localStorage
const localStorageMock: MockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Page - Chat Functionality", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test("renders MingDu heading", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { level: 1, name: "MingDu" })
    ).toBeDefined();
  });

  test("displays initial screen when no messages", () => {
    render(<Page />);

    // Should show the initial help screen
    expect(screen.getByText(/How can I help you learn/i)).toBeDefined();
  });

  test("allows user to submit a message", async () => {
    const user = userEvent.setup();
    const mockHandleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const mockHandleInputChange = vi.fn();
    let inputValue = "";

    // Update the mock to capture input changes
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: inputValue,
      handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        inputValue = e.target.value;
        mockHandleInputChange(e);
      },
      handleSubmit: mockHandleSubmit,
      status: "idle",
      stop: vi.fn(),
      setMessages: vi.fn(),
    } as ReturnType<typeof useChat>);

    render(<Page />);

    // Find the textarea
    const textarea = screen.getByPlaceholderText(/Ask me anything/i);
    expect(textarea).toBeDefined();

    // Type a message
    await user.type(textarea, "Hello, MingDu!");

    // Submit the form
    const form = textarea.closest("form");
    expect(form).toBeDefined();

    await act(async () => {
      fireEvent.submit(form!);
    });

    // Verify handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  test("creates a new conversation when submitting first message", async () => {
    const user = userEvent.setup();
    const mockSetMessages = vi.fn();
    let messages: Message[] = [];

    // Mock useChat to simulate message submission
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages,
      input: "",
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn((e: React.FormEvent) => {
        e.preventDefault();
        // Simulate adding a user message
        messages = [{ id: "1", role: "user", content: "Hello, MingDu!" }];
      }),
      status: "idle",
      stop: vi.fn(),
      setMessages: mockSetMessages,
    } as ReturnType<typeof useChat>);

    render(<Page />);

    // Initially, localStorage should be checked
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      "mingdu-conversations"
    );

    // Type and submit a message
    const textarea = screen.getByPlaceholderText(/Ask me anything/i);
    await user.type(textarea, "Hello, MingDu!");

    const form = textarea.closest("form");
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Wait for conversation creation
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining("mingdu-conversations"),
        expect.any(String)
      );
    });
  });

  test("displays API response on screen", async () => {
    const mockMessages: Message[] = [
      { id: "1", role: "user", content: "Hello, MingDu!" },
      {
        id: "2",
        role: "assistant",
        content: "Hello! I'm here to help you learn Mandarin.",
      },
    ];

    // Mock useChat with messages
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      input: "",
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      status: "idle",
      stop: vi.fn(),
      setMessages: vi.fn(),
    } as ReturnType<typeof useChat>);

    render(<Page />);

    // Check that both messages are displayed
    expect(screen.getByText("Hello, MingDu!")).toBeDefined();
    expect(
      screen.getByText("Hello! I'm here to help you learn Mandarin.")
    ).toBeDefined();
  });

  test("shows conversation in sidebar after creating one", async () => {
    // Mock existing conversation in localStorage
    const mockConversation = {
      id: "123",
      title: "Hello, MingDu!",
      messages: [
        { id: "1", role: "user", content: "Hello, MingDu!" },
        {
          id: "2",
          role: "assistant",
          content: "Hello! I'm here to help you learn Mandarin.",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "mingdu-conversations") {
        return JSON.stringify([mockConversation]);
      }
      if (key === "mingdu-current-conversation") {
        return "123";
      }
      return null;
    });

    // Mock useChat with the conversation messages
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: mockConversation.messages as Message[],
      input: "",
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      status: "idle",
      stop: vi.fn(),
      setMessages: vi.fn(),
    } as ReturnType<typeof useChat>);

    render(<Page />);

    // Wait for the conversation to appear in the sidebar
    await waitFor(() => {
      // The conversation title should appear in the sidebar
      const conversationElement = screen.getByText("Hello, MingDu!", {
        selector: "div.space-y-1 *", // Look within the conversations list
      });
      expect(conversationElement).toBeDefined();
    });
  });

  test("handles streaming API responses", async () => {
    const mockMessages: Message[] = [
      { id: "1", role: "user", content: "Tell me about Beijing" },
    ];

    // Mock useChat with streaming status
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      input: "",
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      status: "streaming",
      stop: vi.fn(),
      setMessages: vi.fn(),
    } as ReturnType<typeof useChat>);

    render(<Page />);

    // Should show loading state
    expect(screen.getByTestId("loading-indicator")).toBeDefined();
  });

  test("allows creating multiple conversations", async () => {
    const user = userEvent.setup();

    // Mock multiple conversations
    const mockConversations = [
      {
        id: "123",
        title: "First conversation",
        messages: [{ id: "1", role: "user", content: "First conversation" }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "456",
        title: "Second conversation",
        messages: [{ id: "2", role: "user", content: "Second conversation" }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "mingdu-conversations") {
        return JSON.stringify(mockConversations);
      }
      return null;
    });

    render(<Page />);

    // Both conversations should appear in the sidebar
    await waitFor(() => {
      expect(screen.getByText("First conversation")).toBeDefined();
      expect(screen.getByText("Second conversation")).toBeDefined();
    });

    // Should be able to click "New Chat" button
    const newChatButton = screen.getByRole("button", { name: /new chat/i });
    expect(newChatButton).toBeDefined();

    await user.click(newChatButton);

    // Verify setItem was called to save the new conversation
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "mingdu-conversations",
        expect.any(String)
      );
    });
  });
});
