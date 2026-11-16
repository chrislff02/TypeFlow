import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface TypingTextProps {
  text: string;
  resetKey: number;
}

function TypingText({ text, resetKey }: TypingTextProps) {
  const [typedText, setTypedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the typing input whenever a new test starts.
  useEffect(() => {
    setTypedText("");
    inputRef.current?.focus();
  }, [resetKey]);

  // Handle the user's typing.
  const handleTyping = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length <= text.length) {
      setTypedText(value);
    }
  };

  return (
    <div
      className="relative cursor-text rounded-xl bg-[#1f2937] p-8"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Invisible input captures keyboard events. */}
      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={handleTyping}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing test input"
        className="absolute h-px w-px opacity-0"
      />

      {/* Render each character individually. */}
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

          const isActive = index === typedText.length;

          return (
            <span key={index} className={`relative ${characterColor}`}>
              {/* Active typing cursor */}
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
