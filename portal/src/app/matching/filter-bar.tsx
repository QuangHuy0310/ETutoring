export default function FilterBar() {
  return (
    <div className="flex gap-4">
      <input type="text" placeholder="Subject" className="border p-2 flex-1 text-black" />
      <input type="text" placeholder="Class" className="border p-2 flex-1 text-black" />
      <input type="text" placeholder="Time" className="border p-2 flex-1 text-black" />
      <input type="text" placeholder="Fee" className="border p-2 flex-1 text-black" />
    </div>
  );
}
