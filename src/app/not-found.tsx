import Link from "next/link";
import { BriefcaseBusiness, House } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="w-full max-w-lg text-center">
        <BrandLogo className="justify-center" />
        <p className="mt-8 text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-semibold">没有找到这个页面</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          链接可能已失效，或对应功能已经移动到其他位置。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">
              <House />
              返回仪表盘
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/jobs">
              <BriefcaseBusiness />
              查看岗位
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
