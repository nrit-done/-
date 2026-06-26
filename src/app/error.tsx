"use client";

import Link from "next/link";
import { AlertTriangle, House, RefreshCw } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="w-full max-w-lg text-center">
        <BrandLogo className="justify-center" />
        <div className="mx-auto mt-8 grid size-14 place-items-center rounded-[8px] bg-danger-soft text-danger">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">页面暂时无法加载</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          数据可能正在更新，请重试。若问题持续存在，可先返回仪表盘继续使用其他功能。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset}>
            <RefreshCw />
            重新加载
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <House />
              返回仪表盘
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
