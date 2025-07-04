import type { Message } from "@ai-sdk/react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Page from "../app/page";

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

// Type for mock localStorage
interface MockLocalStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

// Create a complete mock for useChat hook
const createUseChatMock = (overrides = {}) => ({
  messages: [] as any[],
  input: "",
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  status: "ready" as const,
  stop: vi.fn(),
  setMessages: vi.fn(),
  error: undefined,
  append: vi.fn(),
  reload: vi.fn(),
  isLoading: false,
  data: [],
  setInput: vi.fn(),
  experimental_resume: vi.fn(),
  addToolResult: vi.fn(),
  setData: vi.fn(),
  id: "test-chat-id",
  ...overrides,
});

// Mock the useChat hook from @ai-sdk/react
vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => createUseChatMock()),
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

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  test("displays initial screen when no messages", () => {
    render(<Page />);

    // Should show the initial help screen with TODO text
    expect(screen.getByText("TODO")).toBeDefined();
    // Should show Mingdu heading
    expect(screen.getByText("Mingdu")).toBeDefined();
  });

  test("allows user to submit a message", async () => {
    const user = userEvent.setup();
    const mockHandleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const mockHandleInputChange = vi.fn();
    let inputValue = "";

    // Update the mock to capture input changes
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue(
      createUseChatMock({
        input: inputValue,
        handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          inputValue = e.target.value;
          mockHandleInputChange(e);
        },
        handleSubmit: mockHandleSubmit,
      })
    );

    render(<Page />);

    // Find the textarea with correct placeholder
    const textarea = screen.getByPlaceholderText("Say something...");
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

    // Start with no conversations
    localStorageMock.getItem.mockReturnValue(null);

    // First render with no messages
    const { useChat } = await import("@ai-sdk/react");
    let mockMessages: any[] = [];
    const mockUseChat = createUseChatMock({
      messages: mockMessages,
      handleSubmit: vi.fn((e: React.FormEvent) => {
        e.preventDefault();
        // Simulate adding a user message
        mockMessages = [
          {
            id: "1",
            role: "user",
            content: "Hello, MingDu!",
            parts: [{ type: "text", text: "Hello, MingDu!" }],
          },
        ];
        // Trigger re-render with new messages
        mockUseChat.messages = mockMessages;
      }),
      setMessages: mockSetMessages,
    });

    vi.mocked(useChat).mockReturnValue(mockUseChat);

    const { rerender } = render(<Page />);

    // Initially, localStorage should be checked
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      "mingdu-conversations"
    );

    // Type and submit a message
    const textarea = screen.getByPlaceholderText("Say something...");
    await user.type(textarea, "Hello, MingDu!");

    const form = textarea.closest("form");
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Update the mock to return messages and trigger re-render
    vi.mocked(useChat).mockReturnValue({
      ...mockUseChat,
      messages: mockMessages,
    } as any);

    rerender(<Page />);

    // Wait for conversation creation
    await waitFor(() => {
      // Should create a new conversation
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const calls = localStorageMock.setItem.mock.calls;
      const conversationCall = calls.find(
        (call) => call[0] === "mingdu-conversations"
      );
      expect(conversationCall).toBeDefined();

      // Check that a conversation was saved
      const savedData = JSON.parse(conversationCall![1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].messages).toHaveLength(1);
      expect(savedData[0].messages[0].content).toBe("Hello, MingDu!");
    });
  });

  test("displays API response on screen", async () => {
    const mockMessages: any[] = [
      {
        id: "1",
        role: "user",
        content: "Hello, MingDu!",
        parts: [{ type: "text", text: "Hello, MingDu!" }],
      },
      {
        id: "2",
        role: "assistant",
        content: "Hello! I'm here to help you learn Mandarin.",
        parts: [
          { type: "text", text: "Hello! I'm here to help you learn Mandarin." },
        ],
      },
    ];

    // Mock useChat with messages
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue(
      createUseChatMock({
        messages: mockMessages,
      })
    );

    render(<Page />);

    // Check that both messages are displayed
    await waitFor(() => {
      expect(screen.getByText("Hello, MingDu!")).toBeDefined();
      expect(
        screen.getByText("Hello! I'm here to help you learn Mandarin.")
      ).toBeDefined();
    });
  });

  test("shows conversation in sidebar after creating one", async () => {
    // Mock existing conversation in localStorage
    const mockConversation = {
      id: "123",
      title: "Hello, MingDu!",
      messages: [
        {
          id: "1",
          role: "user",
          content: "Hello, MingDu!",
          parts: [{ type: "text", text: "Hello, MingDu!" }],
        },
        {
          id: "2",
          role: "assistant",
          content: "Hello! I'm here to help you learn Mandarin.",
          parts: [
            {
              type: "text",
              text: "Hello! I'm here to help you learn Mandarin.",
            },
          ],
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
    vi.mocked(useChat).mockReturnValue(
      createUseChatMock({
        messages: mockConversation.messages as Message[],
      })
    );

    render(<Page />);

    // Wait for the conversation to appear in the sidebar
    await waitFor(() => {
      // The conversation title should appear in the sidebar
      const conversationElements = screen.getAllByText("Hello, MingDu!");
      // Should have at least 2: one in sidebar, one in messages
      expect(conversationElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  test("handles streaming API responses", async () => {
    const mockMessages: Message[] = [
      {
        id: "1",
        role: "user",
        content: "Tell me about Beijing",
        parts: [{ type: "text", text: "Tell me about Beijing" }],
      },
    ];

    // Mock useChat with streaming status
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue(
      createUseChatMock({
        messages: mockMessages,
        status: "streaming" as const,
        isLoading: true,
      })
    );

    render(<Page />);

    // Should show a spinner in the textarea area during streaming
    const spinnerElement = screen.getByRole("button", { name: "" });
    expect(spinnerElement.querySelector(".animate-spin")).toBeDefined();
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

    // Should be able to click "New Chat" button (first one in the DOM)
    const newChatButtons = screen.getAllByRole("button", { name: /new chat/i });
    expect(newChatButtons.length).toBeGreaterThan(0);
    const newChatButton = newChatButtons[0];

    await user.click(newChatButton);

    // Verify setItem was called to save the new conversation
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "mingdu-conversations",
        expect.any(String)
      );
    });
  });

  test("switches conversation content when clicking different conversation", async () => {
    const user = userEvent.setup();

    // Mock multiple conversations with messages
    const mockConversations = [
      {
        id: "123",
        title: "First conversation",
        messages: [
          {
            id: "msg1",
            role: "user",
            content: "Hello from first conversation",
            parts: [{ type: "text", text: "Hello from first conversation" }],
          },
          {
            id: "msg2",
            role: "assistant",
            content: "Response in first conversation",
            parts: [{ type: "text", text: "Response in first conversation" }],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "456",
        title: "Second conversation",
        messages: [
          {
            id: "msg3",
            role: "user",
            content: "Hello from second conversation",
            parts: [{ type: "text", text: "Hello from second conversation" }],
          },
          {
            id: "msg4",
            role: "assistant",
            content: "Response in second conversation",
            parts: [{ type: "text", text: "Response in second conversation" }],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "mingdu-conversations") {
        return JSON.stringify(mockConversations);
      }
      if (key === "mingdu-current-conversation") {
        return "123"; // Start with first conversation selected
      }
      return null;
    });

    // Mock useChat to return the first conversation's messages initially
    const { useChat } = await import("@ai-sdk/react");
    const mockSetMessages = vi.fn();

    vi.mocked(useChat).mockReturnValue(
      createUseChatMock({
        messages: mockConversations[0].messages as any[],
        setMessages: mockSetMessages,
      })
    );

    const { rerender } = render(<Page />);

    // First conversation content should be visible
    await waitFor(() => {
      expect(screen.getByText("Hello from first conversation")).toBeDefined();
      expect(screen.getByText("Response in first conversation")).toBeDefined();
    });

    // Click on the second conversation
    const secondConversationElement = screen.getByText("Second conversation");
    await user.click(secondConversationElement);

    // Simulate localStorage update for current conversation
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "mingdu-conversations") {
        return JSON.stringify(mockConversations);
      }
      if (key === "mingdu-current-conversation") {
        return "456"; // Now the second conversation is selected
      }
      return null;
    });

    // Wait for setMessages to be called
    await waitFor(() => {
      expect(mockSetMessages).toHaveBeenCalled();
    });

    // Update the mock to return second conversation's messages
    vi.mocked(useChat).mockReturnValue(
      createUseChatMock({
        messages: mockConversations[1].messages as any[],
        setMessages: mockSetMessages,
      })
    );

    // Trigger re-render to pick up the new mock
    rerender(<Page />);

    // Second conversation content should now be visible
    await waitFor(() => {
      expect(screen.queryByText("Hello from first conversation")).toBeNull();
      expect(screen.queryByText("Response in first conversation")).toBeNull();
      expect(screen.getByText("Hello from second conversation")).toBeDefined();
      expect(screen.getByText("Response in second conversation")).toBeDefined();
    });
  });
});
