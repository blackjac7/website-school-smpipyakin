const shimmerClasses =
  "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg";

const line = (className: string) => (
  <div className={`${shimmerClasses} ${className}`} />
);

const pill = (className: string) => (
  <div className={`${shimmerClasses} rounded-full ${className}`} />
);

export function AnnouncementsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-yellow-500 dark:bg-yellow-600 p-6">{pill("h-8 w-56 bg-white/60 dark:bg-white/20")}</div>
        <div className="p-8 space-y-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border-l-4 border-yellow-400 dark:border-yellow-500 bg-gray-50 dark:bg-gray-800/80 p-4 rounded-r-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {line("h-5 w-3/4 sm:w-1/2")}
                {pill("h-5 w-28")}
              </div>
              {pill("h-4 w-24")}
              {line("h-4 w-2/3")}
            </div>
          ))}
          <div className="flex justify-center">{pill("h-11 w-60")}</div>
        </div>
      </div>
    </section>
  );
}

export function NewsSectionSkeleton() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          {line("h-8 w-64 mx-auto")}
          {pill("h-2 w-24 mx-auto")}
          {line("h-5 w-80 mx-auto")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                {pill("absolute top-4 left-4 h-6 w-24")}
              </div>
              <div className="p-6 space-y-3">
                {line("h-4 w-32")}
                {line("h-5 w-full")}
                {line("h-5 w-11/12")}
                {line("h-5 w-10/12")}
                <div className="pt-2">{line("h-4 w-32")}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">{pill("h-11 w-64")}</div>
      </div>
    </section>
  );
}

export function EventsSkeleton() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          {line("h-8 w-56")}
          {pill("h-10 w-10")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((event) => (
            <div
              key={event}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-t-4 border-yellow-400 dark:border-yellow-500 space-y-4"
            >
              {pill("h-6 w-36")}
              {line("h-6 w-full")}
              {line("h-5 w-5/6")}
              {line("h-5 w-4/5")}
              {line("h-4 w-32")}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">{pill("h-11 w-64")}</div>
      </div>
    </section>
  );
}
