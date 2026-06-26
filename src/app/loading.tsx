import { BrandLogo } from "@/components/brand-logo";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <BrandLogo className="justify-center" />
        <div className="mt-8 space-y-3" aria-label="页面加载中">
          <div className="mx-auto h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-3 w-64 max-w-full animate-pulse rounded bg-muted" />
          <div className="mx-auto h-9 w-28 animate-pulse rounded-[8px] bg-muted" />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">正在加载求职数据...</p>
      </div>
    </main>
  );
}
