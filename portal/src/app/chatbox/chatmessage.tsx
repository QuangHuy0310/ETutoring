export function ChatMessage({ text, sender }: { text: string; sender: "me" | "other" }) {
  return (
    <div className={`flex ${sender === "me" ? "justify-end" : "justify-start"} w-full`}>
      <div className={`p-3 rounded-lg ${sender === "me" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"} w-fit max-w-[80%]`}>
        {text}
      </div>
    </div>
  );
}
