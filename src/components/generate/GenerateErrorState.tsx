'use client';

export function GenerateErrorState({ error }: { error: Error }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Wystąpił błąd podczas ładowania strony
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
