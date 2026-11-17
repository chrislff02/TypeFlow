import { useEffect, useRef, type ChangeEvent } from "react";

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

  // Focus the input when a new test begins.
  useEffect(() => {
    inputRef.current?.focus();
  }, [resetKey]);

  // Handle keyboard input.
  const handleTyping = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const value = event.target.value;

    // Prevent typing beyond the available text.
    if (value.length <= text.length) {
      onTyping(value);
    }
  };

  return (
    <div
      className="relative cursor-text rounded-xl bg-[#1f2937] p-8"
      onClick={() => {
        if (!disabled) {
          inputRef.current?.focus();
        }
      }}
    >
      {/* Hidden input for capturing keyboard events */}
      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={handleTyping}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing test input"
        className="absolute h-px w-px opacity-0"
      />

      {/* Render and highlight individual characters */}
      <div className="break-words text-2xl leading-relaxed tracking-wide">
        {text.split("").map((character, index) => {
          const typedCharacter = typedText[index];

          let characterColor = "text-gray-400";

          if (typedCharacter !== undefined) {
            characterColor =
              typedCharacter === character
                ? "text-emerald-400"
                : "text-red-400";
          }

          const isActive = !disabled && index === typedText.length;

          return (
            <span key={index} className={`relative ${characterColor}`}>
              {isActive && (
                <span className="absolute -left-[2px] top-0 h-full w-[2px] bg-emerald-400" />
              )}

              {character}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default TypingText;
