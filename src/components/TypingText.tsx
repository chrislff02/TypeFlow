import { useEffect, useLayoutEffect, useRef, type ChangeEvent } from "react";

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

  const handleTyping = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const value = event.target.value;
    if (value.length <= text.length) {
      onTyping(value);
    }
  };

  return (
    <div
      className="relative cursor-text rounded-xl bg-app-surface p-8"
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
        <div className="break-words text-2xl leading-[42px] tracking-wide">
          {text.split("").map((character, index) => {
            const typedCharacter = typedText[index];
            let characterColor = "text-app-muted";

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
