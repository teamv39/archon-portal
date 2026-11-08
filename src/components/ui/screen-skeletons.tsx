import { Skeleton } from "@/components/ui/skeleton"
import { TableRow, TableCell } from "@/components/ui/table"

export function CatalogTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`cat-skel-${i}`}>
          <TableCell>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-24" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function PassportSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-96" />
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

export function InboxListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[600px]">
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`inbox-skel-${i}`} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/80 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28 bg-zinc-800" />
              <Skeleton className="h-4 w-16 bg-zinc-800" />
            </div>
            <Skeleton className="h-5 w-4/5 bg-zinc-800" />
            <Skeleton className="h-3 w-32 bg-zinc-800" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <Skeleton className="h-7 w-2/3 bg-zinc-800" />
        <Skeleton className="h-4 w-1/3 bg-zinc-800" />
        <Skeleton className="h-44 w-full bg-zinc-800" />
        <Skeleton className="h-28 w-full bg-zinc-800" />
      </div>
    </div>
  )
}

export function ArchitectureMapSkeleton() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 space-y-3">
      <div className="h-10 w-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      <p className="text-xs text-zinc-400 font-medium">Загрузка архитектурной модели...</p>
    </div>
  )
}
