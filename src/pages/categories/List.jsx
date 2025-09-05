export default function CategoriesList() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black">Add Category</button>
      </div>
      <div className="text-sm text-gray-500">Coming soon…</div>
    </div>
  );
}