import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

interface TypingTextProps {
  text: string;
  typedText: string;
  onTyping: (value: string) => void;
  resetKey: number;
  disabled: boolean;
}

function TypingText({
  text,
  typedText,
  onTyping,
  resetKey,
  disabled,
}: TypingTextProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const activeCharacterRef = useRef<HTMLSpanElement>(null);

  // Focus the input when a new test begins.
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [resetKey, disabled]);

  // Reset the scroll position when restarting.
  useLayoutEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = 0;
    }
  }, [resetKey]);

  // Keep the active character visible while typing.
  useLayoutEffect(() => {
    if (disabled) return;

    const container = textContainerRef.current;
    const activeCharacter = activeCharacterRef.current;

    if (!container || !activeCharacter) return;

    const containerRect = container.getBoundingClientRect();
    const characterRect = activeCharacter.getBoundingClientRect();

    // Leave room for one line below the cursor.
    const lineHeight = 42;
    const bottomBoundary = containerRect.bottom - lineHeight;

    if (characterRect.bottom > bottomBoundary) {
      container.scrollTop += characterRect.bottom - bottomBoundary;
    }

    // Scroll back up when the user presses Backspace.
    if (characterRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - characterRect.top;
    }
  }, [typedText, text, disabled, resetKey]);

  // Keep typing input sequential.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const blockedKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Delete",
    ];

    // Prevent moving the cursor into previously typed text.
    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    // Prevent selecting all typed text.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
    }
  };

  // Process typing input.
  const handleTyping = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const value = event.target.value;

    if (value.length <= text.length) {
      onTyping(value);
    }
  };

  return (
    <div
      className="relative cursor-text rounded-xl border border-app-border bg-app-surface p-4 transition-colors focus-within:border-app-accent sm:p-8"
      onClick={() => {
        if (!disabled) {
          inputRef.current?.focus();
        }
      }}
    >
      {/* Hidden input captures keyboard events. */}
      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        onSelect={(event) => {
          const input = event.currentTarget;
          const end = input.value.length;

          // Keep the actual input cursor at the end.
          if (input.selectionStart !== end || input.selectionEnd !== end) {
            input.setSelectionRange(end, end);
          }
        }}
        onPaste={(event) => event.preventDefault()}
        onDrop={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Typing test input"
        className="absolute h-px w-px opacity-0"
      />

      {/* Fixed-height typing window: three lines. */}
      <div ref={textContainerRef} className="h-[126px] overflow-hidden">
        <div className="break-words text-xl leading-[42px] tracking-wide sm:text-2xl">
          {text.split("").map((character, index) => {
            const typedCharacter = typedText[index];
            let characterColor = "text-app-muted";

            // Highlight correct and incorrect characters.
            if (typedCharacter !== undefined) {
              characterColor =
                typedCharacter === character
                  ? "text-app-accent"
                  : "text-app-error";
            }

            // Detect incorrectly typed spaces.
            const isIncorrectSpace =
              character === " " &&
              typedCharacter !== undefined &&
              typedCharacter !== " ";

            // Identify the current typing position.
            const isActive = !disabled && index === typedText.length;

            return (
              <span
                key={index}
                ref={isActive ? activeCharacterRef : null}
                className={`relative ${characterColor}`}
              >
                {/* Active typing cursor */}
                {isActive && (
                  <span className="absolute -left-[2px] top-0 h-full w-[2px] bg-app-accent" />
                )}

                {/* Highlight incorrectly typed spaces */}
                {isIncorrectSpace && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full rounded-sm bg-app-error"
                  />
                )}

                {character}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TypingText;
